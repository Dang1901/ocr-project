import uuid
from typing import Iterable, Set, Dict

from fastapi import FastAPI
from app.db.session import SessionLocal
from sqlalchemy import text
from app.models.feature import Feature


def _normalize_operation(operation: str) -> str:
    """Chuẩn hóa operation name để match với feature code"""
    return operation.upper().replace("-", "_")


def _get_feature_by_tag_and_operation(tag: str, operation: str, features: list) -> Feature:
    """Tìm feature dựa trên tag và operation name
    
    Logic:
    1. Tìm exact match: operation name match với feature code (sau khi normalize)
    2. Tìm prefix match: tag + "_" + operation prefix match với feature code
    3. Tìm tag prefix match: feature code bắt đầu bằng tag + "_"
    """
    tag_upper = tag.upper()
    operation_normalized = _normalize_operation(operation)
    
    # 1. Tìm exact match: operation name match với feature code
    for feature in features:
        if feature.code and feature.code.upper() == operation_normalized:
            return feature
    
    # 2. Tìm match dựa trên operation prefix + tag
    operation_parts = operation_normalized.split("_")
    if len(operation_parts) > 1:
        possible_codes = [
            operation_normalized,
            f"{tag_upper}_{operation_parts[0]}",
            f"{operation_parts[-1]}_{tag_upper}",
        ]
        for code in possible_codes:
            for feature in features:
                if feature.code and feature.code.upper() == code:
                    return feature
    
    # 3. Tìm prefix match với tag
    prefix = tag_upper + "_"
    matching_features = []
    for feature in features:
        if feature.code and feature.code.upper().startswith(prefix):
            matching_features.append(feature)
    
    if matching_features:
        # Ưu tiên feature có operation name trong code
        for feature in matching_features:
            if operation_normalized in feature.code.upper() or any(
                part in feature.code.upper() for part in operation_parts
            ):
                return feature
        # Nếu không match, trả về feature đầu tiên
        return matching_features[0]
    
    # 4. Tìm feature có code chứa tag
    for feature in features:
        if feature.code and tag_upper in feature.code.upper():
            return feature
    
    return None


def _iter_api_operations(app: FastAPI) -> Iterable[tuple[str, str]]:
    # Exclude these feature codes from sync
    excluded_features = {"AUTHENTICATION", "CURRENT_USER"}
    
    for route in app.routes:
        name = getattr(route, "name", "") or ""
        tags = getattr(route, "tags", []) or []
        if not name or not tags:
            continue
        if not str(route.path).startswith("/api/v1/"):
            continue
        
        feature_code = tags[0].upper()
        # Skip excluded features
        if feature_code in excluded_features:
            continue
            
        yield feature_code, name   # tag = feature_code, name = operation


def sync_feature_operations(app: FastAPI) -> int:
    entries = list(_iter_api_operations(app))
    if not entries:
        return 0

    with SessionLocal() as db:
        # lấy toàn bộ features trong DB
        features = db.query(Feature).all()
        code_to_feature: Dict[str, Feature] = {
            f.code.upper(): f for f in features if getattr(f, "code", None)
        }

        rows = []
        seen: Set[tuple[str, str]] = set()
        for feature_code, operation in entries:
            key = (feature_code, operation)
            if key in seen:
                continue
            seen.add(key)

            # Tìm feature bằng logic phức tạp từ sync_feature_operations.py
            feature = _get_feature_by_tag_and_operation(feature_code, operation, features)
            
            # Nếu không tìm thấy bằng logic phức tạp, thử tìm bằng exact match
            if not feature:
                feature = code_to_feature.get(feature_code.upper())

            # Lấy feature_id từ id của feature
            feature_id = feature.id if feature and feature.id else ""

            rows.append((str(uuid.uuid4()), feature_id, feature_code.upper(), operation))

        if rows:
            sql = (
                "INSERT INTO feature_operations (id, feature_id, feature_code, operation) "
                "VALUES (:id, :feature_id, :feature_code, :operation) "
                "ON DUPLICATE KEY UPDATE "
                "feature_id = VALUES(feature_id), "
                "feature_code = VALUES(feature_code), "
                "operation = VALUES(operation), "
                "updated_at = NOW()"
            )
            param_dicts = [
                {
                    "id": r[0],
                    "feature_id": r[1],
                    "feature_code": r[2],
                    "operation": r[3],
                }
                for r in rows
            ]
            db.execute(text(sql), param_dicts)
            db.commit()

        # Update lại các records đã có nhưng thiếu feature_id dựa trên feature_code
        if code_to_feature:
            update_sql = (
                "UPDATE feature_operations fo "
                "INNER JOIN feature f ON UPPER(f.code) = UPPER(fo.feature_code) "
                "SET fo.feature_id = f.id, fo.updated_at = NOW() "
                "WHERE (fo.feature_id = '' OR fo.feature_id IS NULL) AND f.id IS NOT NULL"
            )
            result = db.execute(text(update_sql))
            if result.rowcount > 0:
                db.commit()
                print(f"✅ Updated {result.rowcount} feature_operations records with missing feature_id")

        return len(rows)


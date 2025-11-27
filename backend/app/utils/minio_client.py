import os
import time
import uuid

from minio import Minio
from threading import Lock
from app.core.config import settings


class MinioService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False
        )
        self.cache = {}
        self.lock = Lock()
        self.cache_ttl = 3600   # 1 hour
        self.default_bucket = settings.MINIO_BUCKET

    def upload_pdf(self, bucket: str, file_path: str) -> str:
        """
        Upload PDF lên MinIO
        return key dạng: uploads/<uuid>.pdf
        """
        key = f"uploads/{uuid.uuid4()}.pdf"
        self.client.fput_object(bucket, key, file_path)
        return f"s3://{bucket}/{key}"

    def upload_image(self, bucket: str, file_path: str, file_extension: str = "png") -> str:
        """
        Upload image lên MinIO
        return s3_path dạng: s3://bucket/key
        """
        key = f"pages/{uuid.uuid4()}.{file_extension}"
        self.client.fput_object(bucket, key, file_path)
        return f"s3://{bucket}/{key}"

    def upload_file_object(self, bucket: str, file_data: bytes, file_name: str) -> str:
        """
        Upload file từ bytes data lên MinIO
        return s3_path dạng: s3://bucket/key
        """
        key = f"uploads/{uuid.uuid4()}_{file_name}"
        from io import BytesIO
        self.client.put_object(bucket, key, BytesIO(file_data), length=len(file_data))
        return f"s3://{bucket}/{key}"

    def get_cached(self, bucket: str, key: str):
        cache_key = f"{bucket}/{key}"

        with self.lock:
            if cache_key in self.cache:
                entry = self.cache[cache_key]
                if entry["expiry"] > time.time():
                    return entry["path"]
                try:
                    os.remove(entry["path"])
                except:
                    pass
                del self.cache[cache_key]

        return None

    def download_to_tmp(self, bucket: str, key: str) -> str:
        """
        Download file về /tmp, cache trong 1h
        """
        cached = self.get_cached(bucket, key)
        if cached:
            return cached

        local_path = f"/tmp/{uuid.uuid4()}_{os.path.basename(key)}"
        self.client.fget_object(bucket, key, local_path)

        with self.lock:
            self.cache[f"{bucket}/{key}"] = {
                "path": local_path,
                "expiry": time.time() + self.cache_ttl
            }

        return local_path

    def loop_clear_expired_cache(self):
        """
        Dọn cache hết hạn
        """
        while True:
            now = time.time()
            with self.lock:
                expired_keys = [
                    k for k, v in self.cache.items() if v["expiry"] <= now
                ]
                for k in expired_keys:
                    try:
                        os.remove(self.cache[k]["path"])
                    except:
                        pass
                    del self.cache[k]

            time.sleep(360)
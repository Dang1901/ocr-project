import React, { useState, useMemo, useEffect } from "react";
import { Table } from "antd";
import { colors } from "@config/colors";
import { useDocumentPermissions } from "@/hooks/queries/document-permission/useDocumentPermissions";
import { documentPermissionColumns } from "./tableConfig";
import { useCreateDocumentPermission } from "@/hooks/mutations/document-permission/useCreateDocumentPermission";
import { useUpdateDocumentPermission } from "@/hooks/mutations/document-permission/useUpdateDocumentPermission";
import { useDeleteDocumentPermission } from "@/hooks/mutations/document-permission/useDeleteDocumentPermission";

const DOCUMENT_TYPES = [
  { code: "bao_cao_tai_chinh", name: "Báo cáo tài chính" },
  { code: "luong", name: "Lương" },
  { code: "ke_hoach", name: "Kế hoạch" },
  { code: "nhan_su", name: "Nhân sự" },
];

interface RoleDocumentPermissionsProps {
  roleCode: string;
}

interface DocumentPermissionData {
  id?: string;
  document_type: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const RoleDocumentPermissions: React.FC<RoleDocumentPermissionsProps> = ({
  roleCode,
}) => {
  const [enableEdit, setEnableEdit] = useState(false);
  const [localData, setLocalData] = useState<DocumentPermissionData[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch role document permissions
  const {
    items: documentPermissions,
    isLoading: permissionsLoading,
    refetch,
  } = useDocumentPermissions({
    role_code: roleCode,
    page: 1,
    pageSize: 100,
  });

  const createMutation = useCreateDocumentPermission({
    showToast: true,
  });

  const updateMutation = useUpdateDocumentPermission({
    showToast: true,
  });

  const deleteMutation = useDeleteDocumentPermission({
    showToast: true,
  });

  // Merge document types with existing permissions
  const mergedData = useMemo(() => {
    const data: DocumentPermissionData[] = DOCUMENT_TYPES.map((docType) => {
      const existing = documentPermissions?.find(
        (p: any) => p.document_type === docType.code
      );
      return existing
        ? {
            id: existing.id,
            document_type: docType.code,
            can_view: existing.can_view,
            can_edit: existing.can_edit,
            can_delete: existing.can_delete,
          }
        : {
            document_type: docType.code,
            can_view: false,
            can_edit: false,
            can_delete: false,
          };
    });
    return data;
  }, [documentPermissions]);

  // Initialize local data when permissions are loaded
  useEffect(() => {
    if (documentPermissions) {
      setLocalData(mergedData);
    }
  }, [documentPermissions, mergedData]);

  const handleCheckboxChange = (
    documentType: string,
    field: "can_view" | "can_edit" | "can_delete",
    checked: boolean
  ) => {
    if (!enableEdit) return;

    setLocalData((prev) =>
      prev.map((item) =>
        item.document_type === documentType
          ? { ...item, [field]: checked }
          : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises: Promise<any>[] = [];

      for (const item of localData) {
        const original = mergedData.find(
          (p) => p.document_type === item.document_type
        );

        // Check if all permissions are false (should delete)
        const allFalse =
          !item.can_view && !item.can_edit && !item.can_delete;

        if (allFalse) {
          // If original exists, delete it
          if (original?.id) {
            promises.push(deleteMutation.mutateAsync(original.id));
          }
          // If original doesn't exist, do nothing (already no permission)
        } else {
          if (original?.id) {
            // Update existing
            const hasChanges =
              original.can_view !== item.can_view ||
              original.can_edit !== item.can_edit ||
              original.can_delete !== item.can_delete;

            if (hasChanges) {
              promises.push(
                updateMutation.mutateAsync({
                  permissionId: original.id,
                  permissionData: {
                    can_view: item.can_view,
                    can_edit: item.can_edit,
                    can_delete: item.can_delete,
                  },
                })
              );
            }
          } else {
            // Create new
            promises.push(
              createMutation.mutateAsync({
                role_code: roleCode,
                document_type: item.document_type,
                can_view: item.can_view,
                can_edit: item.can_edit,
                can_delete: item.can_delete,
              })
            );
          }
        }
      }

      await Promise.all(promises);
      setEnableEdit(false);
      refetch();
    } catch (error) {
      console.error("Error saving document permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(mergedData);
    setEnableEdit(false);
  };

  const canEditPermissions = true; // TODO: Add permission check

  return (
    <>
      <Table
        columns={documentPermissionColumns(
          handleCheckboxChange,
          () => setEnableEdit(!enableEdit),
          handleSave,
          handleCancel,
          enableEdit,
          canEditPermissions,
          saving
        )}
        dataSource={localData}
        rowKey="document_type"
        loading={permissionsLoading}
        pagination={false}
        style={{
          flex: 1,
          minHeight: 0,
          border: `1px solid ${colors.tableBorder}`,
          borderRadius: 0,
          overflow: "auto",
          fontSize: "13px",
          backgroundColor: colors.white,
        }}
        scroll={{ y: "100%" }}
        tableLayout="auto"
      />
    </>
  );
};

export default RoleDocumentPermissions;


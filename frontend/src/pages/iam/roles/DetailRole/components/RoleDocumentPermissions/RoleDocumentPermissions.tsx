import React, { useState, useMemo, useEffect } from "react";
import { Table } from "antd";
import { colors } from "@config/colors";
import { useDocumentPermissions } from "@/hooks/queries/document-permission/useDocumentPermissions";
import { documentPermissionColumns } from "./tableConfig";
import { useCreateDocumentPermission } from "@/hooks/mutations/document-permission/useCreateDocumentPermission";
import { useUpdateDocumentPermission } from "@/hooks/mutations/document-permission/useUpdateDocumentPermission";
import { useDeleteDocumentPermission } from "@/hooks/mutations/document-permission/useDeleteDocumentPermission";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import type { DocumentPermission } from "@/types/document-permission.types";
import CreateDocumentPermission from "./CreateDocumentPermission";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch role document permissions
  const {
    items: documentPermissions,
    isLoading: permissionsLoading,
    refetch,
  } = useDocumentPermissions(
    {
      role_code: roleCode,
      page: 1,
      pageSize: 100,
    },
    !!roleCode // Only enable query when roleCode is available
  );

  const createMutation = useCreateDocumentPermission({
    showToast: true,
  });

  const updateMutation = useUpdateDocumentPermission({
    showToast: true,
  });

  const deleteMutation = useDeleteDocumentPermission({
    showToast: true,
  });

  // Transform document permissions data
  const mergedData = useMemo((): DocumentPermissionData[] => {
    if (!documentPermissions || documentPermissions.length === 0) {
      return [];
    }

    return documentPermissions.map((p: DocumentPermission): DocumentPermissionData => ({
      id: p.id,
      document_type: p.document_type,
      can_view: p.can_view,
      can_edit: p.can_edit,
      can_delete: p.can_delete,
    }));
  }, [documentPermissions]);

  // Initialize local data when permissions are loaded
  useEffect(() => {
    if (!permissionsLoading && mergedData.length > 0) {
      setLocalData(mergedData);
    }
  }, [mergedData, permissionsLoading]);

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

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
  };

  // Check permission to edit document permissions
  const { permissions } = useGetUserPermissions();
  const canEditPermissions = checkPermission(permissions, "DOCUMENT_PERMISSION", "update_document_permission") || 
                            checkPermission(permissions, "DOCUMENT_PERMISSION", "create_document_permission");

  return (
    <>
      <Table
        columns={documentPermissionColumns(
          handleCheckboxChange,
          () => setEnableEdit(!enableEdit),
          handleSave,
          handleCancel,
          handleAdd,
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
      <CreateDocumentPermission
        open={isAddModalOpen}
        onCancel={handleAddCancel}
        onSuccess={handleAddSuccess}
        roleCode={roleCode}
      />
    </>
  );
};

export default RoleDocumentPermissions;


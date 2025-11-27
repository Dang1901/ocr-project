import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "antd";
import { useUpdateDocumentPermission } from "@/hooks/mutations/document-permission/useUpdateDocumentPermission";
import FormDocumentPermission from "./FormDocumentPermission";

interface UpdateDocumentPermissionProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  permission: any;
  roleCode: string;
}

const UpdateDocumentPermission: React.FC<UpdateDocumentPermissionProps> = ({
  open,
  onCancel,
  onSuccess,
  permission,
  roleCode,
}) => {
  const [saving, setSaving] = useState(false);
  const updateDocumentPermissionMutation = useUpdateDocumentPermission({
    showToast: true,
    onSuccess: () => {
      onSuccess();
      setSaving(false);
    },
  });

  const normalizedInitialValues = useMemo(() => {
    if (!permission) return undefined;
    return {
      document_type: permission.document_type,
      can_view: permission.can_view,
      can_edit: permission.can_edit,
      can_delete: permission.can_delete,
    };
  }, [permission]);

  const handleUpdate = async (data: any) => {
    if (!permission?.id) return;
    setSaving(true);
    try {
      await updateDocumentPermissionMutation.mutateAsync({
        permissionId: permission.id,
        permissionData: {
          can_view: data.can_view,
          can_edit: data.can_edit,
          can_delete: data.can_delete,
        },
      });
    } catch (err: any) {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSaving(false);
    }
  }, [open]);

  return (
    <Modal
      title="Edit Document Permission"
      open={open}
      onCancel={handleCancel}
      width={600}
      destroyOnClose
      maskClosable={false}
      centered
      footer={null}
    >
      {normalizedInitialValues && (
        <FormDocumentPermission
          key={open ? `update-open-${permission?.id}` : 'update-closed'}
          mode="update"
          initialValues={normalizedInitialValues}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          roleCode={roleCode}
          loading={saving || updateDocumentPermissionMutation.isPending}
        />
      )}
    </Modal>
  );
};

export default UpdateDocumentPermission;


import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "antd";
import { useUpdatePermission } from "@/hooks/mutations/permission/useUpdatePermission";
import { FormPermission } from "./FormPermission";

interface UpdatePermissionProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  permission: any;
}

const UpdatePermission: React.FC<UpdatePermissionProps> = ({
  open,
  onCancel,
  onSuccess,
  permission,
}) => {
  const [saving, setSaving] = useState(false);
  const updatePermissionMutation = useUpdatePermission({
    showToast: true,
    onSuccess: () => {
      onSuccess();
      setSaving(false);
    },
  });

  const normalizedInitialValues = useMemo(() => {
    if (!permission || !permission[0]) return undefined;
    return {
      role_id: permission[0].role_id,
      feature_id: permission[0].feature_id,
      operation: permission[0].operation,
    };
  }, [permission]);

  const handleUpdatePermission = async (data: any) => {
    if (!permission || !permission[0]?.id) return;
    setSaving(true);
    try {
      await updatePermissionMutation.mutateAsync({
        permissionId: permission[0].id,
        permissionData: {
          role_id: data.role_id,
          feature_id: data.feature_id,
          operation: data.operation,
        },
      });
    } catch (err: any) {
      // Error handling is done in the mutation
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
      title="Edit Permission"
      open={open}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
      maskClosable={false}
      centered
      footer={null}
    >
      {normalizedInitialValues && permission && permission[0] && (
        <FormPermission
          key={open ? `update-open-${permission[0]?.id}` : 'update-closed'}
          mode="update"
          initialValues={normalizedInitialValues}
          onSubmit={handleUpdatePermission}
          onCancel={handleCancel}
          roleId={permission[0]?.role_id || ""}
          roleCode={permission[0]?.role_code || ""}
          loading={saving || updatePermissionMutation.isPending}
        />
      )}
    </Modal>
  );
};

export default UpdatePermission;


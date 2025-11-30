import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useCreatePermissions } from "@/hooks/mutations/permission/useCreatePermissions";
import { FormPermission } from "./FormPermission";
import type { CreatePermissionRequest } from "@/types/permission.types";

interface CreatePermissionProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  roleId: string;
  roleCode: string;
}

const CreatePermission: React.FC<CreatePermissionProps> = ({
  open,
  onCancel,
  onSuccess,
  roleId,
  roleCode,
}) => {
  const [saving, setSaving] = useState(false);
  
  const createPermissionMutation = useCreatePermissions({
    showToast: true,
    onSuccess: () => {
      onSuccess();
      setSaving(false);
    },
  });

  const handleAddNewPermission = async (data: any) => {
    // FormPermission now submits all permissions at once as { permissions: [...] }
    if (data.permissions && Array.isArray(data.permissions)) {
      setSaving(true);
      try {
        await createPermissionMutation.mutateAsync(data.permissions);
      } catch (err: any) {
        setSaving(false);
      }
    } else {
      // Fallback for single permission (shouldn't happen in create mode)
      setSaving(true);
      try {
        await createPermissionMutation.mutateAsync([data]);
      } catch (err: any) {
        setSaving(false);
      }
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
      title="Add Permission"
      open={open}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
      maskClosable={false}
      centered
      footer={null}
    >
      <FormPermission
        key={open ? 'create-open' : 'create-closed'}
        mode="create"
        onSubmit={handleAddNewPermission}
        onCancel={handleCancel}
        roleId={roleId}
        roleCode={roleCode}
        loading={saving || createPermissionMutation.isPending}
      />
    </Modal>
  );
};

export default CreatePermission;


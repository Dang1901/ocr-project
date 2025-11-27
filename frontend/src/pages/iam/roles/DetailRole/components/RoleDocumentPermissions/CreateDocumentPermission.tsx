import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useCreateDocumentPermission } from "@/hooks/mutations/document-permission/useCreateDocumentPermission";
import FormDocumentPermission from "./FormDocumentPermission";

interface CreateDocumentPermissionProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  roleCode: string;
}

const CreateDocumentPermission: React.FC<CreateDocumentPermissionProps> = ({
  open,
  onCancel,
  onSuccess,
  roleCode,
}) => {
  const [saving, setSaving] = useState(false);
  
  const createDocumentPermissionMutation = useCreateDocumentPermission({
    showToast: true,
    onSuccess: () => {
      onSuccess();
      setSaving(false);
    },
  });

  const handleCreate = async (data: any) => {
    setSaving(true);
    try {
      await createDocumentPermissionMutation.mutateAsync(data);
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
      title="Add Document Permission"
      open={open}
      onCancel={handleCancel}
      width={600}
      destroyOnClose
      maskClosable={false}
      centered
      footer={null}
    >
      <FormDocumentPermission
        key={open ? 'create-open' : 'create-closed'}
        mode="create"
        onSubmit={handleCreate}
        onCancel={handleCancel}
        roleCode={roleCode}
        loading={saving || createDocumentPermissionMutation.isPending}
      />
    </Modal>
  );
};

export default CreateDocumentPermission;


import React, { useState } from "react";
import { Modal, Typography, Space, Tag, Button } from "antd";
import { useDeleteDocumentPermission } from "@/hooks/mutations/document-permission/useDeleteDocumentPermission";
import { formatDocumentType } from "./tableConfig/tableColumns";

const { Text } = Typography;

interface DeleteDocumentPermissionProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  permission: any;
}

const DeleteDocumentPermission: React.FC<DeleteDocumentPermissionProps> = ({
  open,
  onCancel,
  onSuccess,
  permission,
}) => {
  const [deleting, setDeleting] = useState(false);
  const deleteDocumentPermissionMutation = useDeleteDocumentPermission({
    showToast: true,
    onSuccess: () => {
      onSuccess();
      setDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (!permission?.id) return;
    setDeleting(true);
    try {
      await deleteDocumentPermissionMutation.mutateAsync(permission.id);
    } catch (error: any) {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Delete Document Permission"
      open={open}
      onCancel={handleCancel}
      width={500}
      destroyOnClose
      maskClosable={false}
      centered
      footer={null}
    >
      <div style={{ marginBottom: 24 }}>
        <Text>
          Are you sure you want to delete this document permission?
        </Text>
        <div style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: '#f5f5f5',
          borderRadius: 6,
          border: '1px solid #d9d9d9',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <Text><Text strong>Document Type:</Text> {formatDocumentType(permission?.document_type || '')}</Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: 8 }}>
            <Tag color={permission?.can_view ? "green" : "default"}>
              Can View: {permission?.can_view ? "Yes" : "No"}
            </Tag>
            <Tag color={permission?.can_edit ? "green" : "default"}>
              Can Edit: {permission?.can_edit ? "Yes" : "No"}
            </Tag>
            <Tag color={permission?.can_delete ? "green" : "default"}>
              Can Delete: {permission?.can_delete ? "Yes" : "No"}
            </Tag>
          </div>
        </div>
        <Text type="danger" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
          This action cannot be undone.
        </Text>
      </div>

      <Space style={{ justifyContent: "flex-end", width: "100%" }}>
        <Button
          onClick={handleCancel}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          danger
          onClick={handleDelete}
          disabled={deleting}
          loading={deleting}
        >
          {deleting ? "Deleting..." : "Delete Permission"}
        </Button>
      </Space>
    </Modal>
  );
};

export default DeleteDocumentPermission;


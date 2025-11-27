import React, { useState } from "react";
import { Modal, Typography, Space, Tag, Button } from "antd";
import { useDeletePermissions } from "@/hooks/mutations/permission/useDeletePermissions";
import { formatRoleCode } from "./tableConfig/tableColumns";

const { Text } = Typography;

interface DeletePermissionProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  permission: any;
}

const DeletePermission: React.FC<DeletePermissionProps> = ({
  open,
  onCancel,
  onSuccess,
  permission,
}) => {
  const [deleting, setDeleting] = useState(false);
  const deletePermissionMutation = useDeletePermissions({
    showToast: true,
    onSuccess: () => {
      onSuccess();
      setDeleting(false);
    },
  });

  const handleDelete = async () => {
    const ids = permission?.map((item: any) => item.permission_id || item.id).filter(Boolean);
    if (!ids || ids.length === 0) return;
    setDeleting(true);
    try {
      await deletePermissionMutation.mutateAsync(ids);
    } catch (error: any) {
      // Error handling is done in the mutation
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Delete Permission"
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
          Are you sure you want to delete this permission?
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
          <Text><Text strong>Feature:</Text> {formatRoleCode(permission?.[0]?.feature_code || '')}</Text>
          <Text strong>Operations:</Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {permission?.map((item: any) => {
              return (
                <Tag
                  key={item.operation}
                  color="default"
                  style={{ fontSize: "12px", margin: 0, width: "fit-content", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {formatRoleCode(item.operation)}
                </Tag>
              )
            })}
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

export default DeletePermission;


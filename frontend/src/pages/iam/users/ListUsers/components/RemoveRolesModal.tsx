import React, { useState, useEffect } from "react";
import { Modal, Table, Button, message, Spin, Checkbox, Space, Typography } from "antd";
import { useGetUserRoles } from "@/hooks/queries/user/useGetUserRoles";
import { useRemoveRoles } from "@/hooks/mutations/user/useRemoveRoles";
import type { User } from "@/types/user.types";

const { Text } = Typography;

interface Role {
  id: string;
  name?: string;
  code: string;
}

interface RemoveRolesModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  user: User | null;
}

const RemoveRolesModal: React.FC<RemoveRolesModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  user,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: userRoles, isLoading: userRolesLoading } = useGetUserRoles(
    user?.id || ""
  );
  const removeRolesMutation = useRemoveRoles();

  useEffect(() => {
    if (visible && user) {
      setSelectedRoles([]);
    }
  }, [visible, user]);

  const handleSubmit = async () => {
    if (!user || selectedRoles.length === 0) {
      message.warning("Please select at least one role to remove");
      return;
    }

    try {
      setLoading(true);
      await removeRolesMutation.mutateAsync({
        user_id: user.id,
        role_ids: selectedRoles,
      });
      
      message.success("Roles removed successfully");
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error?.message || "Failed to remove roles");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedRoles([]);
    onCancel();
  };

  const handleCheckboxChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRoleIds = userRoles?.map((role: Role) => role.id) || [];
      setSelectedRoles(allRoleIds);
    } else {
      setSelectedRoles([]);
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedRoles.length === userRoles?.length && userRoles?.length > 0}
          indeterminate={selectedRoles.length > 0 && selectedRoles.length < (userRoles?.length || 0)}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Select All
        </Checkbox>
      ),
      dataIndex: 'id',
      key: 'checkbox',
      width: 120,
      render: (roleId: string) => (
        <Checkbox
          checked={selectedRoles.includes(roleId)}
          onChange={(e) => handleCheckboxChange(roleId, e.target.checked)}
        />
      ),
    },
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => name || record.code,
    },
  ];

  return (
    <Modal
      title={`Remove Roles from ${user?.fullname || user?.username || 'User'}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={handleSubmit}
          disabled={selectedRoles.length === 0}
        >
          Remove Roles ({selectedRoles.length})
        </Button>,
      ]}
      width={700}
    >
      <Spin spinning={userRolesLoading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            Select roles to remove from this user. You can select multiple roles at once.
          </Text>
          <Table
            columns={columns}
            dataSource={userRoles || []}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
        </Space>
      </Spin>
    </Modal>
  );
};

export default RemoveRolesModal;


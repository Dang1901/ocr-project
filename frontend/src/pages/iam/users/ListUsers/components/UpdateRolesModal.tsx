import React, { useState, useMemo, useEffect } from "react";
import { Modal, Table, Button, message, Spin, Checkbox, Space, Typography } from "antd";
import { useGetRoles } from "@/hooks/queries/role/useGetRoles";
import { useGetUserRoles } from "@/hooks/queries/user/useGetUserRoles";
import { useUpdateRoles } from "@/hooks/mutations/user/useUpdateRoles";
import type { User } from "@/types/user.types";
import { usePagination } from "@/hooks/common/usePagination";

const { Text } = Typography;

interface Role {
  id: string;
  name?: string;
  code: string;
}

interface UpdateRolesModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  user: User | null;
}

const UpdateRolesModal: React.FC<UpdateRolesModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  user,
}) => {
  const [loading, setLoading] = useState(false);
  const { page: rolesPage, pageSize: rolesPageSize } = usePagination(1, 100);

  const { data: rolesData, isLoading: rolesLoading } = useGetRoles({ page: rolesPage, pageSize: rolesPageSize });
  const { data: userRoles, isLoading: userRolesLoading } = useGetUserRoles(
    user?.id || "",
  );
  const updateRolesMutation = useUpdateRoles();

  const roles = rolesData?.items || [];
  
  const initialSelectedRoles = useMemo(() => {
    if (visible && user && userRoles) {
      return userRoles.map((role: Role) => role.id);
    }
    return [];
  }, [visible, user?.id, userRoles]);
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialSelectedRoles);
  
  useEffect(() => {
    setSelectedRoles(initialSelectedRoles);
  }, [initialSelectedRoles]);

  const handleSubmit = async () => {
    if (!user) {
      message.warning("No user selected");
      return;
    }

    try {
      setLoading(true);
      await updateRolesMutation.mutateAsync({
        user_id: user.id,
        role_ids: selectedRoles,
      });
      
      message.success("Roles updated successfully");
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error?.message || "Failed to update roles");
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
      const allRoleIds = roles.map((role: Role) => role.id);
      setSelectedRoles(allRoleIds);
    } else {
      setSelectedRoles([]);
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedRoles.length === roles.length && roles.length > 0}
          indeterminate={selectedRoles.length > 0 && selectedRoles.length < roles.length}
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

  const isLoading = rolesLoading || userRolesLoading;

  return (
    <Modal
      title={`Update Roles for ${user?.fullname || user?.username || 'User'}`}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Update Roles ({selectedRoles.length})
        </Button>,
      ]}
      width={700}
    >
      <Spin spinning={isLoading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            Select roles to assign to this user. This will replace all existing roles.
          </Text>
          <Table
            columns={columns}
            dataSource={roles}
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

export default UpdateRolesModal;


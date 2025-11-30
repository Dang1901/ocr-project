import React, { useState, useEffect } from "react";
import { Modal, Table, Button, message, Spin, Checkbox, Space, Typography, Tag } from "antd";
import { useGetRoles } from "@/hooks/queries/role/useGetRoles";
import { useGetUserRoles } from "@/hooks/queries/user/useGetUserRoles";
import { useAssignRoles } from "@/hooks/mutations/user/useAssignRoles";
import { usePagination } from "@/hooks/common/usePagination";
import type { User } from "@/types/user.types";

const { Text } = Typography;

interface Role {
  id: string;
  name?: string;
  code: string;
  level?: string;
}

interface AssignRolesModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  user: User | null;
}

const AssignRolesModal: React.FC<AssignRolesModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  user,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { page, pageSize } = usePagination(1, 100);

  const { data: rolesData, isLoading: rolesLoading } = useGetRoles({ page, pageSize });
  const { data: userRoles, isLoading: userRolesLoading } = useGetUserRoles(
    user?.id || ""
  );
  const assignRolesMutation = useAssignRoles();

  const roles = rolesData?.items || [];

  useEffect(() => {
    if (visible && user) {
      setSelectedRoles([]);
    }
  }, [visible, user]);

  const handleSubmit = async () => {
    if (!user || selectedRoles.length === 0) {
      message.warning("Please select at least one role");
      return;
    }

    try {
      setLoading(true);
      await assignRolesMutation.mutateAsync({
        user_id: user.id,
        role_ids: selectedRoles,
      });
      
      message.success("Roles assigned successfully");
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error?.message || "Failed to assign roles");
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
      const availableRoleIds = roles.filter((role: Role) => 
        !userRoles?.some((userRole: Role) => userRole.id === role.id)
      ).map((role: Role) => role.id);
      setSelectedRoles(availableRoleIds);
    } else {
      setSelectedRoles([]);
    }
  };

  const currentUserRoleIds = userRoles?.map((role: Role) => role.id) || [];
  const availableRoles = roles.filter((role: Role) => 
    !currentUserRoleIds.includes(role.id)
  );

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedRoles.length === availableRoles.length && availableRoles.length > 0}
          indeterminate={selectedRoles.length > 0 && selectedRoles.length < availableRoles.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        >
          Select All
        </Checkbox>
      ),
      dataIndex: 'id',
      key: 'checkbox',
      width: 120,
      render: (roleId: string) => {
        const isAlreadyAssigned = currentUserRoleIds.includes(roleId);
        return (
          <Checkbox
            checked={selectedRoles.includes(roleId)}
            disabled={isAlreadyAssigned}
            onChange={(e) => handleCheckboxChange(roleId, e.target.checked)}
          />
        );
      },
    },
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => {
        const isAlreadyAssigned = currentUserRoleIds.includes(record.id);
        return (
          <Space>
            <span style={{ color: isAlreadyAssigned ? '#999' : 'inherit' }}>
              {name || record.code}
            </span>
            {isAlreadyAssigned && (
              <Tag color="blue">Already Assigned</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={`Assign Roles to ${user?.fullname || user?.username || 'User'}`}
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
          disabled={selectedRoles.length === 0}
        >
          Assign Roles ({selectedRoles.length})
        </Button>,
      ]}
      width={700}
    >
      <Spin spinning={rolesLoading || userRolesLoading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            Select roles to assign to this user. Roles already assigned are disabled and marked with a tag.
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

export default AssignRolesModal;


import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Modal } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { usePermissionError } from "@/hooks/common/usePermissionError";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import { useUsers } from "@/hooks/queries/user/useUsers";
import PermissionWarningBanner from "@components/common/PermissionWarningBanner";
import { useSyncUsers } from "@/hooks/mutations/user/useSyncUsers";
import { useToggleUserStatus } from "@/hooks/mutations/user/useToggleUserStatus";
import { useResetPassword } from "@/hooks/mutations/user/useResetPassword";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { buildUserColumns } from "./tableConfig";
import CreateUserModal from "./components/CreateUserModal";
import AssignRolesModal from "./components/AssignRolesModal";
import RemoveRolesModal from "./components/RemoveRolesModal";
import UpdateRolesModal from "./components/UpdateRolesModal";
import type { User } from "@/api/user.api";

const ListUsers: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();
  
  // Check permission trước khi gọi API
  const hasListPermission = checkPermission(permissions, "USER", "list_users");

  const usersQuery = useUsers({
    q: debouncedSearch || undefined,
    page,
    pageSize,
  }, hasListPermission);

  const users = usersQuery.data || [];
  const total = usersQuery.total || 0;
  const isLoading = usersQuery.isLoading || isCheckingPermission;
  const refetch = usersQuery.refetch;

  // Check permission error
  const permissionError = usePermissionError(usersQuery.error);

  // Use mutation hook for syncing users
  const syncUsersMutation = useSyncUsers({
    showToast: true,
    onSuccess: () => {
      refetch(); 
    },
  });

  // Use mutation hook for toggling user status
  const toggleStatusMutation = useToggleUserStatus({
    showToast: true,
    onSuccess: () => {
      refetch();
    },
  });

  // Use mutation hook for resetting password
  const resetPasswordMutation = useResetPassword({
    showToast: true,
    onSuccess: () => {
      refetch();
    },
  });

  const handleSyncUsers = () => {
    syncUsersMutation.mutate();
  };

  const handleCreateUser = () => {
    setCreateModalOpen(true);
  };

  const handleToggleStatus = useCallback((userId: string, isActive: boolean) => {
    toggleStatusMutation.mutate({ userId, isActive });
  }, [toggleStatusMutation]);

  const handleResetPassword = useCallback((userId: string) => {
    Modal.confirm({
      title: 'Reset Password',
      content: 'Are you sure you want to reset this user\'s password? A new password will be generated.',
      okText: 'Yes, Reset',
      cancelText: 'Cancel',
      onOk: () => {
        resetPasswordMutation.mutate(userId);
      },
    });
  }, [resetPasswordMutation]);

  const handleAssignRoles = useCallback((userId: string) => {
    const user = users?.find((u: User) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsAssignModalVisible(true);
    }
  }, [users]);

  const handleRemoveRoles = useCallback((userId: string) => {
    const user = users?.find((u: User) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsRemoveModalVisible(true);
    }
  }, [users]);

  const handleUpdateRoles = useCallback((userId: string) => {
    const user = users?.find((u: User) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsUpdateModalVisible(true);
    }
  }, [users]);

  const handleAssignSuccess = () => {
    setIsAssignModalVisible(false);
    setSelectedUser(null);
    refetch();
  };

  const handleRemoveSuccess = () => {
    setIsRemoveModalVisible(false);
    setSelectedUser(null);
    refetch();
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalVisible(false);
    setSelectedUser(null);
    refetch();
  };

  const columns = useMemo(
    () =>
      buildUserColumns({
        handleToggleStatus,
        handleResetPassword,
        handleAssignRoles,
        handleRemoveRoles,
        handleUpdateRoles,
        permissions,
      }),
    [
      handleToggleStatus,
      handleResetPassword,
      handleAssignRoles,
      handleRemoveRoles,
      handleUpdateRoles,
      permissions,
    ]
  );

  // Check if user has permission
  const hasPermission = hasListPermission && !permissionError.isPermissionDenied;
  const showWarning = !isCheckingPermission && !hasPermission;

  return (
    <MainContainer>
      {showWarning && (
        <PermissionWarningBanner message="You do not have sufficient permissions to view this page!" />
      )}
      
      {!showWarning && (
        <>
          <HeaderInformation
            breadcrumbs={[
              { label: "Users" },
            ]}
            title="User Management"
            description="Manage users and their role assignments"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
              style={{ background: colors.primary, borderColor: colors.textPrimary }}
            >
              Add User
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleSyncUsers}
              loading={syncUsersMutation.isPending}
              style={{ background: colors.primary, borderColor: colors.textPrimary }}
            >
              Sync Users
            </Button>
          </div>
        }
      />
      
      <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, width: '100%' }}>
          <InputFilter
            label="Quick search"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (value === "") {
                setPage(1);
              }
            }}
            placeholder="Search by user name or email"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>


      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
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
        scroll={{ x: "max-content" }}
        tableLayout="auto"
      />

      <Pagination
        align="start"
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(p) => setPage(p)}
        onShowSizeChange={(_, size) => setPageSize(size)}
        showSizeChanger
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
        style={{ 
          backgroundColor: colors.white, 
          padding: "16px", 
          borderRadius: 0,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}
      />

      <CreateUserModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      {isAssignModalVisible && (
        <AssignRolesModal
          visible={isAssignModalVisible}
          onCancel={() => {
            setIsAssignModalVisible(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={handleAssignSuccess}
        />
      )}

      {isRemoveModalVisible && (
        <RemoveRolesModal
          visible={isRemoveModalVisible}
          onCancel={() => {
            setIsRemoveModalVisible(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={handleRemoveSuccess}
        />
      )}

      {isUpdateModalVisible && (
        <UpdateRolesModal
          visible={isUpdateModalVisible}
          onCancel={() => {
            setIsUpdateModalVisible(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={handleUpdateSuccess}
        />
      )}
        </>
      )}
    </MainContainer>
  );
};

export default ListUsers;


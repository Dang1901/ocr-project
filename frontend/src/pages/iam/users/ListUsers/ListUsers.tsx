import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Modal } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { useUsers } from "@/hooks/queries/user/useUsers";
import { useSyncUsers } from "@/hooks/mutations/user/useSyncUsers";
import { useToggleUserStatus } from "@/hooks/mutations/user/useToggleUserStatus";
import { useResetPassword } from "@/hooks/mutations/user/useResetPassword";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { buildUserColumns } from "./tableConfig";
import CreateUserModal from "./components/CreateUserModal";

const ListUsers: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: users, total, isLoading, refetch } = useUsers({
    q: debouncedSearch || undefined,
    page,
    pageSize,
  });

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
    onSuccess: (newPassword) => {
      // Show modal with new password
      Modal.success({
        title: 'Password Reset Successfully',
        content: (
          <div>
            <p>The new password has been generated:</p>
            <p style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#1A3636',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              textAlign: 'center',
              fontFamily: 'monospace'
            }}>
              {newPassword}
            </p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Please copy this password and share it with the user securely.
            </p>
          </div>
        ),
        width: 500,
      });
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

  const columns = useMemo(
    () =>
      buildUserColumns({
        handleToggleStatus,
        handleResetPassword,
      }),
    [
      handleToggleStatus,
      handleResetPassword,
    ]
  );

  return (
    <MainContainer>
      <HeaderInformation
        title="User Management"
        description="Manage users and their role assignments"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
              style={{ background: '#1A3636', borderColor: '#1A3636' }}
            >
              Add User
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleSyncUsers}
              loading={syncUsersMutation.isPending}
              style={{ background: '#1A3636', borderColor: '#1A3636' }}
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
          border: "1px solid #eaeaea",
          borderRadius: "6px",
          overflow: "auto",
          fontSize: "13px",
          backgroundColor: "#ffffff",
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
          backgroundColor: "#ffffff", 
          padding: "16px", 
          borderRadius: "6px",
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
    </MainContainer>
  );
};

export default ListUsers;


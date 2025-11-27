import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Modal } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { useGetRoles } from "@/hooks/queries/role/useGetRoles";
import { usePermissionError } from "@/hooks/common/usePermissionError";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import { buildRoleColumns } from "./tableConfig";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import PermissionWarningBanner from "@components/common/PermissionWarningBanner";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import CreateRoleModal from "./components/CreateRoleModal";
import EditRoleModal from "./components/EditRoleModal";
import { useDeleteRole } from "@/hooks/mutations/role/useDeleteRole";
import type { Role } from "@/api/role.api";

const ListRoles: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();
  
  // Check permission trước khi gọi API
  const hasListPermission = checkPermission(permissions, "ROLE", "list_roles");

  const rolesQuery = useGetRoles({
    q: debouncedSearch || undefined,
    page,
    pageSize,
  }, hasListPermission); // Chỉ gọi API nếu có permission

  const roles = rolesQuery.items || [];
  const total = rolesQuery.total || 0;
  const isLoading = rolesQuery.isLoading || isCheckingPermission;
  const refetch = rolesQuery.refetch;
  
  // Check permission error
  const permissionError = usePermissionError(rolesQuery.error);

  const deleteRoleMutation = useDeleteRole({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSyncRoles = () => {
    refetch();
  };

  const handleEdit = useCallback((roleId: string) => {
    const role = roles.find((item) => item.id === roleId) || null;
    if (role) {
      setSelectedRole(role);
      setIsEditModalVisible(true);
    }
  }, [roles]);

  const handleDelete = useCallback((payload: { id: string; name?: string }) => {
    Modal.confirm({
      title: "Delete Role",
      content: `Are you sure you want to delete "${payload.name || "this role"}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteRoleMutation.mutate(payload.id),
    });
  }, [deleteRoleMutation]);

  const columns = useMemo(
    () =>
      buildRoleColumns({
        handleEdit,
        handleDelete,
        permissions,
      }),
    [handleEdit, handleDelete, permissions]
  );

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setSelectedRole(null);
    refetch();
  };

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
              { label: "Roles" },
            ]}
            title="Role Management"
            description="Manage roles and their permissions"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
            >
              Add Role
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleSyncRoles}
              loading={isLoading}
            >
              Refresh
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
            placeholder="Search by role name or code"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={roles || []}
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
        onChange={(p, size) => {
          setPage(p);
          if (size !== pageSize) {
            setPageSize(size);
          }
        }}
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

      <CreateRoleModal
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditRoleModal
        open={isEditModalVisible}
        role={selectedRole}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedRole(null);
        }}
        onSuccess={handleEditSuccess}
      />
        </>
      )}
    </MainContainer>
  );
};

export default ListRoles;


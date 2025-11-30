import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Modal } from "antd";
import { PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { usePermissionError } from "@/hooks/common/usePermissionError";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import { useDepartments } from "@/hooks/queries/department/useDepartments";
import { useDeleteDepartment } from "@/hooks/mutations/department/useDeleteDepartment";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import PermissionWarningBanner from "@components/common/PermissionWarningBanner";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { buildDepartmentColumns } from "./tableConfig";
import CreateDepartmentModal from "./components/CreateDepartmentModal";
import EditDepartmentModal from "./components/EditDepartmentModal";
import type { Department } from "@/types/department.types";

const ListDepartments: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();
  
  // Check permission trước khi gọi API
  const hasListPermission = checkPermission(permissions, "DEPARTMENT", "list_departments");

  const departmentsQuery = useDepartments({
    q: debouncedSearch || undefined,
    page,
    pageSize,
  }, hasListPermission);

  const departments = departmentsQuery.data || [];
  const total = departmentsQuery.total || 0;
  const isLoading = departmentsQuery.isLoading || isCheckingPermission;
  const refetch = departmentsQuery.refetch;

  // Check permission error
  const permissionError = usePermissionError(departmentsQuery.error);

  const deleteDepartmentMutation = useDeleteDepartment({
    showToast: true,
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = useCallback((departmentId: string, name: string) => {
    Modal.confirm({
      title: 'Delete Department',
      content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteDepartmentMutation.mutate(departmentId);
      },
    });
  }, [deleteDepartmentMutation]);

  const handleEdit = useCallback((departmentId: string) => {
    const department = departments?.find((d: any) => d.id === departmentId);
    if (department) {
      setSelectedDepartment(department);
      setIsEditModalVisible(true);
    }
  }, [departments]);

  const handleCreate = useCallback(() => {
    setIsCreateModalVisible(true);
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setSelectedDepartment(null);
    refetch();
  };

  const columns = useMemo(
    () =>
      buildDepartmentColumns({
        handleEdit,
        handleDelete,
        permissions,
      }),
    [handleEdit, handleDelete, permissions]
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
              { label: "Departments" },
            ]}
            title="Department Management"
            description="Manage departments and organizational structure"
            icon={<UnorderedListOutlined />}
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
          >
            Add Department
          </Button>
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
            placeholder="Search by department name..."
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={departments}
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

      <CreateDepartmentModal
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditDepartmentModal
        open={isEditModalVisible}
        department={selectedDepartment}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleEditSuccess}
      />
        </>
      )}
    </MainContainer>
  );
};

export default ListDepartments;


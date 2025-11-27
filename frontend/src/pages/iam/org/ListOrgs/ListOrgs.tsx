import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Tag } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { useGetUserPermissions } from "@/hooks/common/useGetUserPermissions";
import { buildOrgColumns } from "./tableConfig";
import type { OrgType } from "@/types/types";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { useAppDispatch } from "@/store";
import { addToast, createToast } from "@/store/slices/toast_slice";

// Mock data - will be replaced with actual API calls
const mockOrgs: OrgType[] = [
  {
    id: "1",
    name: "Engineering Department",
    code: "ENG",
    description: "Engineering and development team",
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    user_count: 25,
  },
  {
    id: "2",
    name: "Quality Assurance",
    code: "QA",
    description: "Quality assurance and testing team",
    is_active: true,
    created_at: "2024-01-20T14:20:00Z",
    updated_at: "2024-01-20T14:20:00Z",
    user_count: 15,
  },
  {
    id: "3",
    name: "Product Management",
    code: "PM",
    description: "Product management and planning",
    is_active: true,
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-02-01T09:15:00Z",
    user_count: 8,
  },
  {
    id: "4",
    name: "Operations",
    code: "OPS",
    description: "Operations and support team",
    is_active: false,
    created_at: "2024-02-10T11:00:00Z",
    updated_at: "2024-02-10T11:00:00Z",
    user_count: 12,
  },
];  

const ListOrgs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Get all user permissions
  const { permissions } = useGetUserPermissions();

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Filter orgs based on search query
  const filteredOrgs = useMemo(() => {
    if (!debouncedSearch) return mockOrgs;
    const query = debouncedSearch.toLowerCase();
    return mockOrgs.filter(
      (org) =>
        org.name.toLowerCase().includes(query) ||
        org.code.toLowerCase().includes(query) ||
        (org.description && org.description.toLowerCase().includes(query))
    );
  }, [debouncedSearch]);

  // Paginate filtered orgs
  const paginatedOrgs = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrgs.slice(start, end);
  }, [filteredOrgs, page, pageSize]);

  const total = filteredOrgs.length;

  const handleSyncOrgs = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      dispatch(addToast(createToast.success("Organizations synced successfully")));
    }, 1000);
  };

  const handleEdit = useCallback((orgId: string) => {
    dispatch(addToast(createToast.info("Edit Organization", `Edit organization: ${orgId}`)));
  }, [dispatch]);

  const handleDelete = useCallback((payload: { id: string; name: string }) => {
    dispatch(addToast(createToast.warning("Delete Organization", `Delete organization: ${payload.name}`)));
  }, [dispatch]);

  const handleToggleActive = useCallback((orgId: string) => {
    dispatch(addToast(createToast.info("Toggle Active Status", `Toggle active status for organization: ${orgId}`)));
  }, [dispatch]);

  const columns = useMemo(
    () =>
      buildOrgColumns({
        handleEdit,
        handleDelete,
        handleToggleActive,
        permissions,
      }),
    [handleEdit, handleDelete, handleToggleActive, permissions]
  );

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "Organizations" },
        ]}
        title="Organization Management"
        description="Manage organizations and their members"
        action={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleSyncOrgs}
            loading={loading}
            style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
          >
            Sync Organizations
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
            placeholder="Search by organization name or code"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={paginatedOrgs}
        rowKey="id"
        loading={loading}
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
    </MainContainer>
  );
};

export default ListOrgs;


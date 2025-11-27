import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Tag } from "antd";
import { ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { buildActivityLogColumns } from "./tableConfig";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import type { ActivityLogType } from "@/types/types";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { useAppDispatch } from "@/store";
import { addToast, createToast } from "@/store/slices/toast_slice";

// Mock data - will be replaced with actual API calls
const mockActivityLogs: ActivityLogType[] = [
  {
    id: "1",
    user_id: "1",
    user_name: "John Doe",
    action: "CREATE",
    resource_type: "User",
    resource_id: "5",
    resource_name: "new.user@example.com",
    status: "success",
    ip_address: "192.168.1.100",
    created_at: "2024-03-15T10:30:00Z",
  },
  {
    id: "2",
    user_id: "2",
    user_name: "Jane Smith",
    action: "UPDATE",
    resource_type: "Role",
    resource_id: "2",
    resource_name: "Project Manager",
    status: "success",
    ip_address: "192.168.1.101",
    created_at: "2024-03-15T09:20:00Z",
  },
  {
    id: "3",
    user_id: "1",
    user_name: "John Doe",
    action: "DELETE",
    resource_type: "User",
    resource_id: "3",
    resource_name: "bob.johnson@example.com",
    status: "success",
    ip_address: "192.168.1.100",
    created_at: "2024-03-15T08:15:00Z",
  },
  {
    id: "4",
    user_id: "3",
    user_name: "Bob Johnson",
    action: "LOGIN",
    resource_type: "Auth",
    status: "success",
    ip_address: "192.168.1.102",
    created_at: "2024-03-15T07:00:00Z",
  },
  {
    id: "5",
    user_id: "2",
    user_name: "Jane Smith",
    action: "CREATE",
    resource_type: "Organization",
    resource_id: "4",
    resource_name: "Operations",
    status: "failed",
    ip_address: "192.168.1.101",
    created_at: "2024-03-14T16:45:00Z",
  },
];

const ActivityLog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Filter logs based on search query
  const filteredLogs = useMemo(() => {
    if (!debouncedSearch) return mockActivityLogs;
    const query = debouncedSearch.toLowerCase();
    return mockActivityLogs.filter(
      (log) =>
        (log.user_name && log.user_name.toLowerCase().includes(query)) ||
        log.action.toLowerCase().includes(query) ||
        log.resource_type.toLowerCase().includes(query) ||
        (log.resource_name && log.resource_name.toLowerCase().includes(query)) ||
        (log.ip_address && log.ip_address.toLowerCase().includes(query))
    );
  }, [debouncedSearch]);

  // Paginate filtered logs
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, page, pageSize]);

  const total = filteredLogs.length;

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      dispatch(addToast(createToast.success("Activity log refreshed")));
    }, 1000);
  };

  const handleExport = () => {
    dispatch(addToast(createToast.info("Export Activity Log", "Exporting activity log...")));
  };

  const columns = useMemo(
    () => buildActivityLogColumns(),
    []
  );

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "Activity Log" },
        ]}
        title="Activity Log"
        description="View system activity and user actions"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
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
            placeholder="Search by user, action, or resource"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={paginatedLogs}
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

export default ActivityLog;


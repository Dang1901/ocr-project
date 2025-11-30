import React, { useState, useMemo, useEffect } from "react";
import { Table, Pagination, Button, Input, Spin } from "antd";
import { ReloadOutlined, DownloadOutlined, HistoryOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { buildActivityLogColumns } from "./tableConfig";
import HeaderInformation from "@components/common/HeaderInformation";
import PermissionWarningBanner from "@/components/common/PermissionWarningBanner";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import InputFilter from "@components/common/InputFilter";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { useAppDispatch } from "@/store";
import { addToast, createToast } from "@/store/slices/toast_slice";
import { useActivityLogs } from "@/hooks/queries/activity-log/useActivityLogs";

const ActivityLog: React.FC = () => {
  const dispatch = useAppDispatch();
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<number | undefined>();

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: page - 1, // Backend uses 0-based indexing
      size: pageSize,
    };

    if (userFilter) {
      params.user_id = userFilter;
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (debouncedSearch) {
      params.path = debouncedSearch;
    }

    return params;
  }, [page, pageSize, userFilter, statusFilter, debouncedSearch]);

  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();
  
  // Check permission trước khi xem Activity Log
  const hasGetPermission = checkPermission(permissions, "ACTIVITY_LOG", "get_activity_log");

  const { data: activityLogs, total, isLoading, refetch } = useActivityLogs(apiParams, hasGetPermission);

  const handleRefresh = () => {
    refetch();
    dispatch(addToast(createToast.success("Activity log refreshed")));
  };

  const handleExport = () => {
    dispatch(addToast(createToast.info("Export Activity Log", "Exporting activity log...")));
  };

  const columns = useMemo(
    () => buildActivityLogColumns(),
    []
  );

  // Reset to page 1 when filters change (but not on initial mount)
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, userFilter, statusFilter]);

  if (isCheckingPermission) {
    return (
      <MainContainer>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <Spin size="large" />
        </div>
      </MainContainer>
    );
  }

  // Show permission warning if no permission
  if (!hasGetPermission) {
    return (
      <MainContainer>
        <PermissionWarningBanner
          message="You do not have sufficient permissions to view this page!"
        />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "Activity Log" },
        ]}
        title="Activity Log"
        description="View system activity and user actions"
        icon={<HistoryOutlined />}
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
              loading={isLoading}
              style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
            >
              Refresh
            </Button>
          </div>
        }
      />
      
      <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, width: '100%', flexWrap: 'wrap' }}>
          <InputFilter
            label="Search Path"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
            }}
            placeholder="Search by path"
            width={300}
            onPressEnter={() => {
              setPage(1);
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '12px', color: '#666' }}>User ID</label>
            <Input
              placeholder="Filter by user ID"
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value || undefined);
              }}
              style={{ width: 200 }}
              allowClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Status Code</label>
            <Input
              type="number"
              placeholder="Filter by status code"
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value ? parseInt(value, 10) : undefined);
              }}
              style={{ width: 150 }}
              allowClear
            />
          </div>
        </div>
      </FilterContainer>

      <Table
        columns={columns}
        dataSource={activityLogs}
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
    </MainContainer>
  );
};

export default ActivityLog;


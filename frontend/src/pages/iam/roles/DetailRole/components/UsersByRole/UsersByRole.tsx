import React, { useState } from "react";
import { Table, Input, Pagination, Tag } from "antd";
import { IconSearch } from "@tabler/icons-react";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useGetUsersByRole } from "@/hooks/queries/role/useGetUsersByRole";
import type { UserType } from "@/types/types";
import { FilterContainer } from "@/components/layout/MainContainer.styles";

interface UsersByRoleProps {
  roleId: string;
}

const UsersByRole: React.FC<UsersByRoleProps> = ({ roleId }) => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, total, isLoading } = useGetUsersByRole({
    roleId,
    q: searchQuery || undefined,
    page,
    pageSize,
  });

  const columns = [
    {
      title: "User",
      key: "user",
      width: 200,
      render: (_: any, record: UserType) => (
        <div style={{ fontWeight: 500, fontSize: "14px" }}>
          {record.fullname || `${record.first_name || ''} ${record.last_name || ''}`.trim() || record.username}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => (
        <span style={{ fontSize: "13px" }}>{email}</span>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 150,
      render: (username: string) => (
        <span style={{ fontSize: "13px" }}>{username || "N/A"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" || status === "active" ? "green" : "red"}>
          {status || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (created_at: string) => (
        <span style={{ fontSize: "13px" }}>
          {created_at ? new Date(created_at).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <>
      <FilterContainer>
        <div
          style={{
            width: 300,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <label style={{ fontSize: "13px", fontWeight: "600" }}>
            Quick Search
          </label>
          <Input
            value={searchQuery}
            allowClear
            placeholder="Search users by name, email, or username"
            prefix={<IconSearch size={16} />}
            onChange={(e) => {
              const v = e.target.value;
              setSearchQuery(v);
              if (v === "") {
                setPage(1);
              }
            }}
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
        showTotal={(t, range) => `${range[0]}-${range[1]} of ${t}`}
        style={{
          backgroundColor: colors.white,
          padding: "10px",
          borderRadius: 0,
        }}
      />
    </>
  );
};

export default UsersByRole;


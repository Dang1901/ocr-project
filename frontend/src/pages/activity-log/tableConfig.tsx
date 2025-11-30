import type { ActivityLog } from "@/types/activity-log.types";
import type { ColumnsType } from "antd/es/table";

export const buildActivityLogColumns = (): ColumnsType<ActivityLog> => {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "#52c41a"; // green
      case "POST":
        return "#fa8c16"; // orange
      case "PUT":
      case "PATCH":
        return "#1890ff"; // blue
      case "DELETE":
        return "#cf1322"; // red
      default:
        return "#000000";
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return "#52c41a"; // success - green
    } else if (status >= 300 && status < 400) {
      return "#1890ff"; // redirect - blue
    } else if (status >= 400 && status < 500) {
      return "#faad14"; // client error - orange
    } else if (status >= 500) {
      return "#ff4d4f"; // server error - red
    }
    return "#000000";
  };

  return [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 200,
      render: (user: ActivityLog['user'], record: ActivityLog) => {
        if (user) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: "13px", color: "#000000", fontWeight: 500 }}>
                {user.fullname || user.username}
              </span>
              <span style={{ fontSize: "11px", color: "#666" }}>
                {user.email}
              </span>
            </div>
          );
        }
        return (
          <span style={{ fontSize: "13px", color: "#999" }}>
            {record.user_id || "Anonymous"}
          </span>
        );
      },
      sorter: (a: ActivityLog, b: ActivityLog) => {
        const aName = a.user?.username || a.user_id || '';
        const bName = b.user?.username || b.user_id || '';
        return aName.localeCompare(bName);
      },
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      width: 100,
      render: (method: string) => (
        <span style={{ 
          fontSize: "13px", 
          fontWeight: 600, 
          color: getMethodColor(method) 
        }}>
          {method}
        </span>
      ),
      sorter: (a: ActivityLog, b: ActivityLog) => a.method.localeCompare(b.method),
    },
    {
      title: "Route Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string | null) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {name || "--"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "response_status",
      key: "response_status",
      width: 100,
      render: (status: number) => (
        <span style={{ 
          fontSize: "13px", 
          fontWeight: 500, 
          color: getStatusColor(status) 
        }}>
          {status}
        </span>
      ),
      sorter: (a: ActivityLog, b: ActivityLog) => 
        a.response_status - b.response_status,
    },
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (created_at: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {created_at ? new Date(created_at).toLocaleString() : '--'}
        </span>
      ),
      sorter: (a: ActivityLog, b: ActivityLog) => 
        (a.created_at || '').localeCompare(b.created_at || ''),
      defaultSortOrder: "descend" as const,
    },
  ];
};


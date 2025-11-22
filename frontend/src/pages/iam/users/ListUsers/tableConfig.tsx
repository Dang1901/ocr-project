import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown } from "antd";
import { IconDotsVertical, IconLock, IconToggleLeft, IconToggleRight } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import StatusBadge from "@/components/common/StatusBadge";
import RoleTags from "./components/RoleTags";
import type { RoleType, UserType } from "@/types/types";

interface UserColumnProps {
  handleToggleStatus?: (userId: string, isActive: boolean) => void;
  handleResetPassword?: (userId: string) => void;
}

export const buildUserColumns = ({
  handleToggleStatus,
  handleResetPassword,
}: UserColumnProps): ColumnsType<UserType> => {
  const getActionMenu = (record: UserType): MenuProps => {
    const menuItems = [];

    if (handleToggleStatus) {
      const isActive = record.status === "ACTIVE" || record.status === "active";
      menuItems.push({
        key: "toggle-status",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            {isActive ? <IconToggleLeft size={16} /> : <IconToggleRight size={16} />}
            {isActive ? "Deactivate User" : "Activate User"}
          </span>
        ),
        onClick: () => handleToggleStatus(record.id, !isActive),
      });
    }

    if (handleResetPassword) {
      menuItems.push({
        key: "reset-password",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconLock size={16} /> Reset Password
          </span>
        ),
        onClick: () => handleResetPassword(record.id),
      });
    }
    
    return { items: menuItems };
  };

  return [
    {
      title: "User",
      key: "user",
      width: 200,
      render: (_: any, record: UserType) => (
        <div style={{ fontWeight: 500, fontSize: "14px", color: "#000000" }}>
          {record.first_name} {record.last_name}
        </div>
      ),
      sorter: (a: UserType, b: UserType) => 
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>{email}</span>
      ),
      sorter: (a: UserType, b: UserType) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      width: 250,
      render: (roles: RoleType[]) => {
        return <RoleTags roles={roles || []} maxDisplay={2} />;
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => <StatusBadge status={status} />,
      sorter: (a: UserType, b: UserType) => 
        (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (created_at: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {created_at ? new Date(created_at).toLocaleDateString() : '--'}
        </span>
      ),
      sorter: (a: UserType, b: UserType) => 
        (a.created_at || '').localeCompare(b.created_at || ''),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_, record: UserType) => {
        const menu = getActionMenu(record);
        if (menu.items && menu.items.length > 0) {
          return (
            <Dropdown
              menu={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<IconDotsVertical size={16} />}
                size="small"
                style={{
                  border: "none",
                  boxShadow: "none",
                  outline: "none",
                  color: "#1A3636"
                }}
                onFocus={(e) => e.target.blur()}
              />
            </Dropdown>
          );
        }
        return null;
      },
    },
  ];
};


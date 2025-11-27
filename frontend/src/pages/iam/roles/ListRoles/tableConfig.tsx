import type { Role } from "@/api/role.api";
import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown } from "antd";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/common/StatusBadge";
import { hasPermission } from "@/hooks/common/useGetUserPermissions";

interface RoleColumnProps {
  handleEdit?: (roleId: string) => void;
  handleDelete?: (payload: { id: string; name?: string }) => void;
  permissions?: { [featureCode: string]: string[] };
}

export const buildRoleColumns = ({
  handleEdit,
  handleDelete,
  permissions = {},
}: RoleColumnProps): ColumnsType<Role> => {
  const getActionMenu = (record: Role): MenuProps => {
    const menuItems = [];
    
    // Check permission for edit
    if (handleEdit && hasPermission(permissions, "ROLE", "update_role")) {
      menuItems.push({
        key: "edit",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconEdit size={16} /> Edit Role
          </span>
        ),
        onClick: () => handleEdit(record.id),
      });
    }

    // Check permission for delete
    if (handleDelete && record.code !== "ADMIN" && hasPermission(permissions, "ROLE", "delete_role")) {
      menuItems.push({
        key: "delete",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4d4f", fontWeight: 500 }}>
            <IconTrash size={16} /> Delete Role
          </span>
        ),
        onClick: () => handleDelete({ id: record.id, name: record.name }),
      });
    }
    
    return { items: menuItems };
  };

  return [
    {
      title: "Role Name",
      key: "name",
      width: 200,
      render: (_: any, record: Role) => (
        <Link 
          to={`/roles/${record.id}`}
          style={{ 
            fontWeight: 500, 
            fontSize: "14px", 
            color: "#1890ff",
            textDecoration: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
            e.currentTarget.style.color = "#40a9ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
            e.currentTarget.style.color = "#1890ff";
          }}
        >
          {record.name || "--"}
        </Link>
      ),
      sorter: (a: Role, b: Role) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 180,
      render: (_: string, record: Role) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", color: "#000000" }}>
            {record.level || "--"}
          </span>
          {record.level_int !== undefined && (
            <span style={{ fontSize: "11px", color: "#888" }}>
              Order: {record.level_int}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 200,
      render: (_: any, record: Role) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {record.department?.name || "--"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      align: "center" as const,
      render: (is_active: number | undefined) => {
        const active = is_active === undefined ? true : is_active === 1;
        return <StatusBadge status={active ? "ACTIVE" : "INACTIVE"} />;
      },
      sorter: (a: Role, b: Role) =>
        (a.is_active ?? 1) - (b.is_active ?? 1),
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
      sorter: (a: Role, b: Role) => 
        (a.created_at || '').localeCompare(b.created_at || ''),
    },
    // Only include Actions column if there are any actions available
    ...((
      (handleEdit && hasPermission(permissions, "ROLE", "update_role")) ||
      (handleDelete && hasPermission(permissions, "ROLE", "delete_role"))
    ) ? [{
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_, record: Role) => {
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
    }] : []),
  ];
};


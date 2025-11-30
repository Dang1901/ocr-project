import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown } from "antd";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import type { Department } from "@/types/department.types";
import { hasPermission } from "@/hooks/common/useGetUserPermissions";

interface DepartmentColumnProps {
  handleEdit?: (departmentId: string) => void;
  handleDelete?: (departmentId: string, name: string) => void;
  permissions?: { [featureCode: string]: string[] };
}

export const buildDepartmentColumns = ({
  handleEdit,
  handleDelete,
  permissions = {},
}: DepartmentColumnProps): ColumnsType<Department> => {
  const getActionMenu = (record: Department): MenuProps => {
    const menuItems = [];

    // Check permission for edit
    if (handleEdit && hasPermission(permissions, "DEPARTMENT", "update_department")) {
      menuItems.push({
        key: "edit",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconEdit size={16} /> Edit
          </span>
        ),
        onClick: () => handleEdit(record.id),
      });
    }

    // Check permission for delete
    if (handleDelete && hasPermission(permissions, "DEPARTMENT", "delete_department")) {
      menuItems.push({
        key: "delete",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4d4f", fontWeight: 500 }}>
            <IconTrash size={16} /> Delete
          </span>
        ),
        onClick: () => handleDelete(record.id, record.name),
      });
    }

    return { items: menuItems };
  };

  return [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (name: string) => (
        <div style={{ fontWeight: 500, fontSize: "14px", color: "#000000" }}>
          {name}
        </div>
      ),
      sorter: (a: Department, b: Department) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 200,
      render: (created_at: string | undefined) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {created_at ? new Date(created_at).toLocaleDateString() : '--'}
        </span>
      ),
      sorter: (a: Department, b: Department) => 
        ((a as any).created_at || '').localeCompare((b as any).created_at || ''),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 200,
      render: (updated_at: string | undefined) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {updated_at ? new Date(updated_at).toLocaleDateString() : '--'}
        </span>
      ),
      sorter: (a: Department, b: Department) => 
        ((a as any).updated_at || '').localeCompare((b as any).updated_at || ''),
    },
    // Only include Actions column if there are any actions available
    ...((
      (handleEdit && hasPermission(permissions, "DEPARTMENT", "update_department")) ||
      (handleDelete && hasPermission(permissions, "DEPARTMENT", "delete_department"))
    ) ? [{
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Department) => {
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


import type { OrgType } from "@types/types";
import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown, Tag } from "antd";
import { IconDotsVertical, IconEdit, IconTrash,  } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import { hasPermission } from "@/hooks/common/useGetUserPermissions";

interface OrgColumnProps {
  handleEdit?: (orgId: string) => void;
  handleDelete?: (payload: { id: string; name: string }) => void;
  handleToggleActive?: (orgId: string) => void;
  permissions?: { [featureCode: string]: string[] };
}

export const buildOrgColumns = ({
  handleEdit,
  handleDelete,
  handleToggleActive,
  permissions = {},
}: OrgColumnProps): ColumnsType<OrgType> => {
  const getActionMenu = (record: OrgType): MenuProps => {
    const menuItems = [];
    
    // if (handleToggleActive) {
    //   menuItems.push({
    //     key: "toggle-active",
    //     label: (
    //       <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
    //         <IconToggle size={16} /> {record.is_active ? "Deactivate" : "Activate"}
    //       </span>
    //     ),
    //     onClick: () => handleToggleActive(record.id),
    //   });
    // }

    // Check permission for edit
    if (handleEdit && hasPermission(permissions, "ORG", "update_org")) {
      menuItems.push({
        key: "edit",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#1A3636", fontWeight: 500 }}>
            <IconEdit size={16} /> Edit Organization
          </span>
        ),
        onClick: () => handleEdit(record.id),
      });
    }

    // Check permission for delete
    if (handleDelete && hasPermission(permissions, "ORG", "delete_org")) {
      menuItems.push({
        key: "delete",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4d4f", fontWeight: 500 }}>
            <IconTrash size={16} /> Delete Organization
          </span>
        ),
        onClick: () => handleDelete({ id: record.id, name: record.name }),
      });
    }
    
    return { items: menuItems };
  };

  return [
    {
      title: "Organization Name",
      key: "name",
      width: 250,
      render: (_: any, record: OrgType) => (
        <div style={{ fontWeight: 500, fontSize: "14px", color: "#000000" }}>
          {record.name}
        </div>
      ),
      sorter: (a: OrgType, b: OrgType) => a.name.localeCompare(b.name),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string) => (
        <Tag color="#1A3636" style={{ fontSize: "12px", fontWeight: 600 }}>
          {code}
        </Tag>
      ),
      sorter: (a: OrgType, b: OrgType) => a.code.localeCompare(b.code),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (description: string) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {description || "--"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 100,
      render: (is_active: boolean) => (
        <Tag color={is_active ? "#1A3636" : "default"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a: OrgType, b: OrgType) => (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0),
    },
    {
      title: "Members",
      dataIndex: "user_count",
      key: "user_count",
      width: 100,
      render: (count: number) => (
        <span style={{ fontSize: "13px", color: "#000000", fontWeight: 500 }}>
          {count || 0}
        </span>
      ),
      sorter: (a: OrgType, b: OrgType) => (a.user_count || 0) - (b.user_count || 0),
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
      sorter: (a: OrgType, b: OrgType) => 
        (a.created_at || '').localeCompare(b.created_at || ''),
    },
    // Only include Actions column if there are any actions available
    ...((
      (handleEdit && hasPermission(permissions, "ORG", "update_org")) ||
      (handleDelete && hasPermission(permissions, "ORG", "delete_org"))
    ) ? [{
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_, record: OrgType) => {
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


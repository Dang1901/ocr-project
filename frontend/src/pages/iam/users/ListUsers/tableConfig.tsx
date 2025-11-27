import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown } from "antd";
import { IconDotsVertical, IconLock, IconToggleLeft, IconToggleRight } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import StatusBadge from "@/components/common/StatusBadge";
import RoleTags from "./components/RoleTags";
import type { RoleType, UserType } from "@/types/types";
import { hasPermission } from "@/hooks/common/useGetUserPermissions";
import { colors } from "@config/colors";

interface UserColumnProps {
  handleToggleStatus?: (userId: string, isActive: boolean) => void;
  handleResetPassword?: (userId: string) => void;
  handleAssignRoles?: (userId: string) => void;
  handleRemoveRoles?: (userId: string) => void;
  handleUpdateRoles?: (userId: string) => void;
  permissions?: { [featureCode: string]: string[] };
}

export const buildUserColumns = ({
  handleToggleStatus,
  handleResetPassword,
  handleAssignRoles,
  handleRemoveRoles,
  handleUpdateRoles,
  permissions = {},
}: UserColumnProps): ColumnsType<UserType> => {
  const getActionMenu = (record: UserType): MenuProps => {
    const menuItems = [];

    // Check permission for toggle status
    if (handleToggleStatus && hasPermission(permissions, "USER", "toggle_user_status")) {
      const isActive = record.status === "ACTIVE" || record.status === "active";
      menuItems.push({
        key: "toggle-status",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: colors.textPrimary, fontWeight: 500 }}>
            {isActive ? <IconToggleLeft size={16} /> : <IconToggleRight size={16} />}
            {isActive ? "Deactivate User" : "Activate User"}
          </span>
        ),
        onClick: () => handleToggleStatus(record.id, !isActive),
      });
    }

    // Check permission for reset password
    if (handleResetPassword && hasPermission(permissions, "USER", "reset_user_password")) {
      menuItems.push({
        key: "reset-password",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: colors.textPrimary, fontWeight: 500 }}>
            <IconLock size={16} /> Reset Password
          </span>
        ),
        onClick: () => handleResetPassword(record.id),
      });
    }

    // Check permission for assign roles
    if (handleAssignRoles && hasPermission(permissions, "USER", "assign_roles_to_user")) {
      menuItems.push({
        key: "assign-roles",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: colors.textPrimary, fontWeight: 500 }}>
            Assign Roles
          </span>
        ),
        onClick: () => handleAssignRoles(record.id),
      });
    }

    // Check permission for update roles
    if (handleUpdateRoles && hasPermission(permissions, "USER", "update_user_roles")) {
      menuItems.push({
        key: "update-roles",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: colors.textPrimary, fontWeight: 500 }}>
            Update Roles
          </span>
        ),
        onClick: () => handleUpdateRoles(record.id),
      });
    }

    // Check permission for remove roles
    if (handleRemoveRoles && hasPermission(permissions, "USER", "remove_roles_from_user")) {
      menuItems.push({
        key: "remove-roles",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: colors.error, fontWeight: 500 }}>
            Remove Roles
          </span>
        ),
        onClick: () => handleRemoveRoles(record.id),
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
        <div style={{ fontWeight: 500, fontSize: "14px", color: colors.textBlack }}>
          {record.fullname || `${record.first_name || ''} ${record.last_name || ''}`.trim() || record.username}
        </div>
      ),
      sorter: (a: UserType, b: UserType) => {
        const nameA = a.fullname || `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.username;
        const nameB = b.fullname || `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.username;
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      render: (email: string) => (
        <span style={{ fontSize: "13px", color: colors.textBlack }}>{email}</span>
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
        <span style={{ fontSize: "13px", color: colors.textBlack }}>
          {created_at ? new Date(created_at).toLocaleDateString() : '--'}
        </span>
      ),
      sorter: (a: UserType, b: UserType) =>
        (a.created_at || '').localeCompare(b.created_at || ''),
    },
    // Only include Actions column if there are any actions available
    ...((
      (handleToggleStatus && hasPermission(permissions, "USER", "toggle_user_status")) ||
      (handleResetPassword && hasPermission(permissions, "USER", "reset_user_password")) ||
      (handleAssignRoles && hasPermission(permissions, "USER", "assign_roles_to_user")) ||
      (handleRemoveRoles && hasPermission(permissions, "USER", "remove_roles_from_user")) ||
      (handleUpdateRoles && hasPermission(permissions, "USER", "update_user_roles"))
    ) ? [{
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: UserType) => {
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
                  color: colors.textPrimary
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


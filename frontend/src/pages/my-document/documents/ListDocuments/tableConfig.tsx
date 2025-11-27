import type { ColumnsType } from "antd/es/table";
import { Button, Dropdown } from "antd";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import type { MenuProps } from "antd";
import { Link } from "react-router-dom";
import type { Document } from "@/api/document.api";
import { hasPermission } from "@/hooks/common/useGetUserPermissions";

interface DocumentColumnProps {
  handleEdit?: (documentId: string) => void;
  handleDelete?: (documentId: string, filename: string) => void;
  permissions?: { [featureCode: string]: string[] };
}

export const buildDocumentColumns = ({
  handleEdit,
  handleDelete,
  permissions = {},
}: DocumentColumnProps): ColumnsType<Document> => {
  const getActionMenu = (record: Document): MenuProps => {
    const menuItems = [];

    // Check permission for edit
    if (handleEdit && hasPermission(permissions, "DOCUMENT", "update_document")) {
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
    if (handleDelete && hasPermission(permissions, "DOCUMENT", "delete_document")) {
      menuItems.push({
        key: "delete",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff4d4f", fontWeight: 500 }}>
            <IconTrash size={16} /> Delete
          </span>
        ),
        onClick: () => handleDelete(record.id, record.filename),
      });
    }

    return { items: menuItems };
  };

  return [
    {
      title: "Filename",
      dataIndex: "filename",
      key: "filename",
      width: 250,
      render: (filename: string, record: Document) => (
        <Link 
          to={`/documents/${record.id}`}
          style={{ fontWeight: 500, fontSize: "14px", color: "#1890ff" }}
        >
          {filename}
        </Link>
      ),
      sorter: (a: Document, b: Document) => (a.filename || "").localeCompare(b.filename || ""),
    },
    {
      title: "File Path",
      dataIndex: "file_path",
      key: "file_path",
      width: 300,
      render: (file_path: string) => (
        <span style={{ fontSize: "13px", color: "#666666" }}>
          {file_path}
        </span>
      ),
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "department",
      width: 200,
      render: (_: any, record: Document) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {record.department?.name || '--'}
        </span>
      ),
    },
    {
      title: "Document Type",
      dataIndex: "document_type",
      key: "document_type",
      width: 150,
      render: (document_type: string | null) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {document_type || '--'}
        </span>
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      width: 120,
      render: (owner: string | null) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {owner || '--'}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (created_at: string | null) => (
        <span style={{ fontSize: "13px", color: "#000000" }}>
          {created_at ? new Date(created_at).toLocaleDateString() : '--'}
        </span>
      ),
      sorter: (a: Document, b: Document) => 
        ((a.created_at || '').localeCompare(b.created_at || '')),
    },
    // Only include Actions column if there are any actions available
    ...((
      (handleEdit && hasPermission(permissions, "DOCUMENT", "update_document")) ||
      (handleDelete && hasPermission(permissions, "DOCUMENT", "delete_document"))
    ) ? [{
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Document) => {
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


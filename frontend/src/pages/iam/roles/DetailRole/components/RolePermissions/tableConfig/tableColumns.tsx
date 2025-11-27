import {
  IconCheck,
  IconEdit,
  IconLoader,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Tag } from "antd";

export const formatRoleCode = (str: string) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getListPermission = (
  permission: any,
  enableEdit: boolean,
  handleDelete: (permission: any[]) => void,
  handleAdd: (permission: any[]) => void,
  addLoadingId: string | null
) => {
  const owner = permission.own;
  const loading = addLoadingId === permission.id;
  if (owner) {
    if (enableEdit) {
      return (
        <Tag
          key={permission.operation}
          color={permission.own ? "green" : "default"}
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
          }}
        >
          {formatRoleCode(permission.operation)}
          {loading ? (
            <IconLoader
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#1A3636" }}
            />
          ) : (
            <IconX
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#dc3545" }}
              onClick={() => handleDelete([permission])}
            />
          )}
        </Tag>
      );
    } else {
      return (
        <Tag
          key={permission.operation}
          color={permission.own ? "green" : "blue"}
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
          }}
        >
          {formatRoleCode(permission.operation)}
          {loading ? (
            <IconLoader
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#1A3636" }}
            />
          ) : (
            <IconCheck
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#08a029" }}
            />
          )}
        </Tag>
      );
    }
  } else {
    if (enableEdit) {
      return (
        <Tag
          key={permission.operation}
          color="#e4e4e4"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
            color: "#929292",
            cursor: "pointer",
          }}
          onClick={() => handleAdd([permission])}
        >
          {loading ? (
            <IconLoader
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#1A3636" }}
            />
          ) : (
            <IconPlus
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#008800" }}
            />
          )}
          {formatRoleCode(permission.operation)}
        </Tag>
      );
    } else {
      return (
        <Tag
          key={permission.operation}
          color="#e4e4e4"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
            color: "#929292",
            cursor: "pointer",
          }}
        >
          <IconX
            size={16}
            stroke={2}
            style={{ cursor: "pointer", color: "#7c7c7c" }}
          />
          {formatRoleCode(permission.operation)}
        </Tag>
      );
    }
  }
};

export const getFeature = (
  record: any,
  featureCode: any,
  enableEdit: boolean,
  handleDelete: (permission: any[]) => void,
  handleAdd: (permission: any) => void,
  addLoadingId: string | null
) => {
  const owner = record.own;
  const loading = addLoadingId === record?.feature_code;
  if (owner) {
    if (enableEdit) {
      return (
        <Tag
          key={featureCode}
          color="blue"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            minWidth: "100px",
            justifyContent: "center",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
          }}
        >
          {formatRoleCode(featureCode)}
        </Tag>
      );
    } else {
      return (
        <Tag
          key={featureCode}
          color="blue"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            minWidth: "100px",
            justifyContent: "center",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
          }}
        >
          {formatRoleCode(featureCode)}
        </Tag>
      );
    }
  } else {
    if (enableEdit) {
      return (
        <Tag
          key={featureCode}
          color="#e4e4e4"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            minWidth: "100px",
            justifyContent: "center",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
            color: "#929292",
            cursor: "pointer",
          }}
          onClick={() => handleAdd(record.permissions)}
        >
          {formatRoleCode(featureCode)}
        </Tag>
      );
    } else {
      return (
        <Tag
          key={featureCode}
          color="#e4e4e4"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            minWidth: "100px",
            justifyContent: "center",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
            color: "#929292",
            cursor: "pointer",
          }}
        >
          {formatRoleCode(featureCode)}
        </Tag>
      );
    }
  }
};

export const getAction = (
  record: any,
  enableEdit: boolean,
  handleDelete: (permission: any[]) => void,
  handleAdd: (permission: any) => void,
  addLoadingId: string | null
) => {
  const owner = record.own;
  const loading = addLoadingId === record?.feature_code;
  if (owner) {
    if (enableEdit) {
      return (
        <Tag
          key={record.feature_code}
          color="red"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
            cursor: "pointer",
          }}
          onClick={() => handleDelete(record.permissions)}
        >
          {loading ? (
            <IconLoader
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#1A3636" }}
            />
          ) : (
            <IconTrash size={16} />
          )}
        </Tag>
      );
    }
  } else {
    if (enableEdit) {
      return (
        <Tag
          key={record.feature_code}
          color="green"
          style={{
            fontSize: "12px",
            margin: 0,
            width: "fit-content",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            height: "24px",
            cursor: "pointer",
          }}
          onClick={() => handleAdd(record.permissions)}
        >
          {loading ? (
            <IconLoader
              size={16}
              stroke={2}
              style={{ cursor: "pointer", color: "#1A3636" }}
            />
          ) : (
            <IconPlus size={16} />
          )}
        </Tag>
      );
    }
  }
  return null;
};

export const permissionColumns = (
  handleDelete: (permission: any[]) => void,
  handleAdd: (permission: any) => void,
  changeEnableEdit: () => void,
  enableEdit: boolean,
  addLoadingId: string | null,
  canEditPermissions: boolean
) => [
  {
    title: "Feature",
    dataIndex: "feature_code",
    key: "feature_code",
    width: "10%",
    render: (featureCode: string, record: any) => {
      return getFeature(
        record,
        featureCode,
        enableEdit,
        handleDelete,
        handleAdd,
        addLoadingId
      );
    },
  },
  {
    title: "Permissions",
    dataIndex: "permissions",
    key: "permissions",
    width: "80%",
    render: (permissions: any) => {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {permissions.map((permission: any) => {
            return getListPermission(
              permission,
              enableEdit,
              handleDelete,
              handleAdd,
              addLoadingId
            );
          })}
        </div>
      );
    },
  },
  {
    title: (
      <div
        style={{
          textAlign: "right",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {canEditPermissions && (
          <Tag
            color={enableEdit ? "#ffd0d5" : "#1A3636"}
            style={{
              fontSize: "12px",
              margin: 0,
              width: "fit-content",
              fontWeight: "500",
              display: "flex",
              color: enableEdit ? "#dc3545" : "#ffffff",
              alignItems: "center",
              gap: "4px",
              height: "24px",
              cursor: "pointer",
            }}
            onClick={changeEnableEdit}
          >
            {enableEdit ? <IconX size={16} /> : <IconEdit size={16} />}
            <span>{enableEdit ? "Cancel" : "Edit"}</span>
          </Tag>
        )}
      </div>
    ),
    dataIndex: "feature_code",
    key: "action",
    width: "10%",
    render: (featureCode: string, record: any) => {
      return (
        <div
          style={{
            textAlign: "right",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {getAction(record, enableEdit, handleDelete, handleAdd, addLoadingId)}
        </div>
      );
    },
  },
];


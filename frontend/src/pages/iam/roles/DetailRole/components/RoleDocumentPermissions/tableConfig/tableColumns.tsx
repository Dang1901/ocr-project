import { Tag, Checkbox } from "antd";
import { IconEdit, IconX, IconCheck } from "@tabler/icons-react";
import { colors } from "@config/colors";

const DOCUMENT_TYPES = [
  { code: "bao_cao_tai_chinh", name: "Báo cáo tài chính" },
  { code: "luong", name: "Lương" },
  { code: "ke_hoach", name: "Kế hoạch" },
  { code: "nhan_su", name: "Nhân sự" },
];

export const formatDocumentType = (code: string) => {
  const type = DOCUMENT_TYPES.find(t => t.code === code);
  return type ? type.name : code;
};

export const documentPermissionColumns = (
  handleCheckboxChange: (documentType: string, field: "can_view" | "can_edit" | "can_delete", checked: boolean) => void,
  changeEnableEdit: () => void,
  handleSave: () => void,
  handleCancel: () => void,
  enableEdit: boolean,
  canEditPermissions: boolean,
  saving: boolean
) => [
  {
    title: "Document Type",
    dataIndex: "document_type",
    key: "document_type",
    width: "30%",
    render: (documentType: string) => {
      return (
        <Tag
          color="blue"
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
          {formatDocumentType(documentType)}
        </Tag>
      );
    },
  },
  {
    title: "Can View",
    dataIndex: "can_view",
    key: "can_view",
    width: "20%",
    render: (canView: boolean, record: any) => {
      return (
        <Checkbox
          checked={canView}
          disabled={!enableEdit || !canEditPermissions}
          onChange={(e) => handleCheckboxChange(record.document_type, "can_view", e.target.checked)}
        />
      );
    },
  },
  {
    title: "Can Edit",
    dataIndex: "can_edit",
    key: "can_edit",
    width: "20%",
    render: (canEdit: boolean, record: any) => {
      return (
        <Checkbox
          checked={canEdit}
          disabled={!enableEdit || !canEditPermissions}
          onChange={(e) => handleCheckboxChange(record.document_type, "can_edit", e.target.checked)}
        />
      );
    },
  },
  {
    title: "Can Delete",
    dataIndex: "can_delete",
    key: "can_delete",
    width: "20%",
    render: (canDelete: boolean, record: any) => {
      return (
        <Checkbox
          checked={canDelete}
          disabled={!enableEdit || !canEditPermissions}
          onChange={(e) => handleCheckboxChange(record.document_type, "can_delete", e.target.checked)}
        />
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
          gap: "8px",
        }}
      >
        {canEditPermissions && (
          <>
            {enableEdit ? (
              <>
                <Tag
                  color={colors.error}
                  style={{
                    fontSize: "12px",
                    margin: 0,
                    width: "fit-content",
                    fontWeight: "500",
                    display: "flex",
                    color: colors.error,
                    alignItems: "center",
                    gap: "4px",
                    height: "24px",
                    cursor: "pointer",
                  }}
                  onClick={handleCancel}
                >
                  <IconX size={16} />
                  <span>Cancel</span>
                </Tag>
                <Tag
                  color={colors.textPrimary}
                  style={{
                    fontSize: "12px",
                    margin: 0,
                    width: "fit-content",
                    fontWeight: "500",
                    display: "flex",
                    color: colors.white,
                    alignItems: "center",
                    gap: "4px",
                    height: "24px",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                  onClick={saving ? undefined : handleSave}
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <IconCheck size={16} />
                      <span>Save</span>
                    </>
                  )}
                </Tag>
              </>
            ) : (
              <Tag
                color={colors.textPrimary}
                style={{
                  fontSize: "12px",
                  margin: 0,
                  width: "fit-content",
                  fontWeight: "500",
                  display: "flex",
                  color: colors.white,
                  alignItems: "center",
                  gap: "4px",
                  height: "24px",
                  cursor: "pointer",
                }}
                onClick={changeEnableEdit}
              >
                <IconEdit size={16} />
                <span>Edit</span>
              </Tag>
            )}
          </>
        )}
      </div>
    ),
    key: "action",
    width: "10%",
    render: () => null,
  },
];


import React, { useEffect } from "react";
import { Form, Checkbox, Button, Space, Select } from "antd";

const DOCUMENT_TYPES = [
  { code: "bao_cao_tai_chinh", name: "Báo cáo tài chính" },
  { code: "luong", name: "Lương" },
  { code: "ke_hoach", name: "Kế hoạch" },
  { code: "nhan_su", name: "Nhân sự" },
];

type Props = {
  mode: "create" | "update";
  initialValues?: {
    document_type?: string;
    can_view?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  roleCode: string;
  loading?: boolean;
};

const FormDocumentPermission: React.FC<Props> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  roleCode,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        role_code: roleCode,
        document_type: values.document_type,
        can_view: values.can_view || false,
        can_edit: values.can_edit || false,
        can_delete: values.can_delete || false,
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        can_view: false,
        can_edit: false,
        can_delete: false,
        ...initialValues,
      }}
    >
      <Form.Item
        name="document_type"
        label="Document Type"
        rules={[{ required: true, message: "Please select a document type" }]}
      >
        <Select
          placeholder="Select document type"
          disabled={mode === "update"}
          options={DOCUMENT_TYPES.map((type) => ({
            label: type.name,
            value: type.code,
          }))}
        />
      </Form.Item>

      <Form.Item name="can_view" valuePropName="checked">
        <Checkbox>Can View</Checkbox>
      </Form.Item>

      <Form.Item name="can_edit" valuePropName="checked">
        <Checkbox>Can Edit</Checkbox>
      </Form.Item>

      <Form.Item name="can_delete" valuePropName="checked">
        <Checkbox>Can Delete</Checkbox>
      </Form.Item>

      <Form.Item>
        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === "create" ? "Create" : "Update"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default FormDocumentPermission;


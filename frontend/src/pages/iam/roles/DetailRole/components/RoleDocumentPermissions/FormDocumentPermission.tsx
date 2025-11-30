import React, { useEffect, useMemo } from "react";
import { Form, Checkbox, Button, Space, Select, Spin } from "antd";
import { useDepartmentTypes } from "@/hooks/queries/department/useDepartmentTypes";
import type { DepartmentType } from "@/types/department.types";

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

  // Fetch document types from API (department types)
  const { data: documentTypes, isLoading: isLoadingTypes } = useDepartmentTypes(
    { page: 1, pageSize: 100 }, // Get all types
    true
  );

  // Map document types to options for Select
  const documentTypeOptions = useMemo(() => {
    return documentTypes.map((type: DepartmentType) => ({
      label: type.name,
      value: type.code,
    }));
  }, [documentTypes]);

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
          placeholder={isLoadingTypes ? "Loading..." : "Select document type"}
          disabled={mode === "update" || isLoadingTypes}
          loading={isLoadingTypes}
          options={documentTypeOptions}
          notFoundContent={isLoadingTypes ? <Spin size="small" /> : "No document types found"}
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


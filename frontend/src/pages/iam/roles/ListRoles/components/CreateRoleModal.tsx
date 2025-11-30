import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Switch, Select } from "antd";
import { useCreateRole } from "@/hooks/mutations/role/useCreateRole";
import type { RolePayload } from "@/types/role.types";
import { useDepartments } from "@/hooks/queries/department/useDepartments";
import type { Department } from "@/types/department.types";
import { usePagination } from "@/hooks/common/usePagination";

interface CreateRoleModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface RoleFormValues {
  name: string;
  level?: string;
  level_int?: number | null;
  department_id?: string | null;
  is_active?: boolean;
}

const mapValuesToPayload = (values: RoleFormValues): RolePayload => ({
  name: values.name,
  code: values.name.trim().toUpperCase().replace(/\s+/g, "_"),
  level: values.level || undefined,
  level_int:
    values.level_int !== undefined && values.level_int !== null
      ? Number(values.level_int)
      : undefined,
  department_id: values.department_id?.trim() || undefined,
  is_active: values.is_active === false ? 0 : 1,
});

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const {page, pageSize} = usePagination();
  const [form] = Form.useForm<RoleFormValues>();
  const { data: departments, isLoading: departmentsLoading } = useDepartments({
    page,
    pageSize,
  });
  const createRoleMutation = useCreateRole({
    onSuccess: () => {
      form.resetFields();
      onSuccess();
    },
  });

  const departmentOptions = useMemo(
    () =>
      (departments || []).map((department: Department) => ({
        label: department.name,
        value: department.id,
      })),
    [departments],
  );

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createRoleMutation.mutate(mapValuesToPayload(values));
    } catch (error) {
      // validation errors handled by antd
    }
  };

  return (
    <Modal
      title="Create Role"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={createRoleMutation.isPending}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_active: true }}
      >
        <Form.Item
          label="Role Name"
          name="name"
          rules={[
            { required: true, message: "Please enter role name" },
            { max: 128, message: "Name must be less than 128 characters" },
          ]}
        >
          <Input placeholder="Ex: Finance Reviewer" />
        </Form.Item>

        <Form.Item label="Level" name="level">
          <Input placeholder="Ex: Senior" />
        </Form.Item>

        <Form.Item label="Level Order" name="level_int">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="Higher number = higher priority"
          />
        </Form.Item>

        <Form.Item label="Department ID" name="department_id">
          <Select
            showSearch
            allowClear
            placeholder="Select department (optional)"
            options={departmentOptions}
            loading={departmentsLoading}
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="is_active"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRoleModal;


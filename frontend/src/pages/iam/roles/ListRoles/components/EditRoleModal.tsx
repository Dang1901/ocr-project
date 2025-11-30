import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, InputNumber, Switch, Select } from "antd";
import { useUpdateRole } from "@/hooks/mutations/role/useUpdateRole";
import type { Role, RoleUpdatePayload } from "@/types/role.types";
import { useDepartments } from "@/hooks/queries/department/useDepartments";
import { usePagination } from "@/hooks/common/usePagination";
import type { Department } from "@/types/department.types";

interface EditRoleModalProps {
  open: boolean;
  role: Role | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface RoleFormValues {
  name?: string;
  level?: string;
  level_int?: number | null;
  department_id?: string | null;
  is_active?: boolean;
}

const mapValuesToPayload = (values: RoleFormValues): RoleUpdatePayload => ({
  name: values.name,
  code: values.name ? values.name.trim().toUpperCase().replace(/\s+/g, "_") : undefined,
  level: values.level || undefined,
  level_int:
    values.level_int !== undefined && values.level_int !== null
      ? Number(values.level_int)
      : undefined,
  department_id:
    values.department_id !== undefined && values.department_id !== null
      ? values.department_id.trim() || undefined
      : undefined,
  is_active:
    values.is_active === undefined
      ? undefined
      : values.is_active
      ? 1
      : 0,
});

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  open,
  role,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<RoleFormValues>();
  const {page, pageSize} = usePagination();
  const { data: departments, isLoading: departmentsLoading } = useDepartments({
    page,
    pageSize,
  });
  const updateRoleMutation = useUpdateRole({
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
    if (open && role) {
      form.setFieldsValue({
        name: role.name,
        level: role.level,
        level_int: role.level_int ?? null,
        department_id: role.department_id ?? null,
        is_active: role.is_active === undefined ? true : role.is_active === 1,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, role, form]);

  const handleSubmit = async () => {
    if (!role) return;

    try {
      const values = await form.validateFields();
      updateRoleMutation.mutate({
        roleId: role.id,
        payload: mapValuesToPayload(values),
      });
    } catch (error) {
      // validation handled by antd
    }
  };

  return (
    <Modal
      title="Edit Role"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Update"
      cancelText="Cancel"
      confirmLoading={updateRoleMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
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

export default EditRoleModal;


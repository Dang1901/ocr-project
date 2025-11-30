import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useUpdateDepartment } from '@/hooks/mutations/department/useUpdateDepartment';
import type { Department, DepartmentBase } from '@/types/department.types';

interface EditDepartmentModalProps {
  open: boolean;
  department: Department | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  open,
  department,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const updateDepartmentMutation = useUpdateDepartment({
    showToast: true,
    onSuccess: () => {
      form.resetFields();
      onSuccess();
    },
  });

  useEffect(() => {
    if (open && department) {
      form.setFieldsValue({
        name: department.name,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, department, form]);

  const handleSubmit = async () => {
    if (!department) return;
    
    try {
      const values = await form.validateFields();
      updateDepartmentMutation.mutate({
        departmentId: department.id,
        departmentData: values as Partial<DepartmentBase>,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Edit Department"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={updateDepartmentMutation.isPending}
      okText="Update"
      cancelText="Cancel"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter department name' },
            { max: 128, message: 'Name must be less than 128 characters' },
          ]}
        >
          <Input placeholder="Enter department name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDepartmentModal;


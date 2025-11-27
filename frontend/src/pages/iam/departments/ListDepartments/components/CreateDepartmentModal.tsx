import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useCreateDepartment } from '@/hooks/mutations/department/useCreateDepartment';
import type { DepartmentBase } from '@/api/department.api';

interface CreateDepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const createDepartmentMutation = useCreateDepartment({
    showToast: true,
    onSuccess: () => {
      form.resetFields();
      onSuccess();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createDepartmentMutation.mutate(values as DepartmentBase);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Create Department"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={createDepartmentMutation.isPending}
      okText="Create"
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

export default CreateDepartmentModal;


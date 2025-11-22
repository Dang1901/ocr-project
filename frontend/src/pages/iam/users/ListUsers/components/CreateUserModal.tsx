import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useCreateUser } from '@/hooks/mutations/user/useCreateUser';
import type { CreateUserRequest } from '@/api/user.api';

interface CreateUserModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const createUserMutation = useCreateUser({
    showToast: true,
    onSuccess: () => {
      form.resetFields();
      onSuccess?.();
      onCancel();
    },
  });

  const handleSubmit = async (values: CreateUserRequest) => {
    await createUserMutation.mutateAsync(values);
  };

  return (
    <Modal
      title="Create New User"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Username is required' },
            { min: 3, message: 'Username must be at least 3 characters' },
            { max: 64, message: 'Username must not exceed 64 characters' },
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          name="first_name"
          label="First Name"
          rules={[{ max: 64, message: 'First name must not exceed 64 characters' }]}
        >
          <Input placeholder="Enter first name (optional)" />
        </Form.Item>

        <Form.Item
          name="last_name"
          label="Last Name"
          rules={[{ max: 64, message: 'Last name must not exceed 64 characters' }]}
        >
          <Input placeholder="Enter last name (optional)" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createUserMutation.isPending}
              style={{ background: '#1A3636', borderColor: '#1A3636' }}
            >
              Create User
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;




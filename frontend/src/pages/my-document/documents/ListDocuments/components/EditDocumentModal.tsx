import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useUpdateDocument } from '@/hooks/mutations/document/useUpdateDocument';
import { useDepartments } from '@/hooks/queries/department/useDepartments';
import { usePagination } from '@/hooks/common/usePagination';
import type { Document, DocumentUpdatePayload } from '@/api/document.api';

interface EditDocumentModalProps {
  open: boolean;
  document: Document | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  open,
  document,
  onCancel,
  onSuccess,
}) => {
  const { page, pageSize } = usePagination();
  const [form] = Form.useForm();
  const updateDocumentMutation = useUpdateDocument({
    showToast: true,
    onSuccess: () => {
      form.resetFields();
      onSuccess();
    },
  });

  const { data: departments } = useDepartments({
    page,
    pageSize: 100, // Get all departments
  });

  const departmentOptions = useMemo(
    () =>
      (departments || []).map((department: any) => ({
        label: department.name,
        value: department.id,
      })),
    [departments],
  );

  useEffect(() => {
    if (open && document) {
      form.setFieldsValue({
        filename: document.filename,
        file_path: document.file_path,
        department_id: document.department_id,
        document_type: document.document_type,
        status: document.status,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, document, form]);

  const handleSubmit = async () => {
    if (!document) return;
    
    try {
      const values = await form.validateFields();
      updateDocumentMutation.mutate({
        documentId: document.id,
        documentData: values as DocumentUpdatePayload,
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Edit Document"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={updateDocumentMutation.isPending}
      okText="Update"
      cancelText="Cancel"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="filename"
          label="Filename"
          rules={[
            { required: true, message: 'Please enter filename' },
            { max: 255, message: 'Filename must be less than 255 characters' },
          ]}
        >
          <Input placeholder="Enter filename" />
        </Form.Item>

        <Form.Item
          name="file_path"
          label="File Path"
          rules={[
            { required: true, message: 'Please enter file path' },
            { max: 512, message: 'File path must be less than 512 characters' },
          ]}
        >
          <Input placeholder="Enter file path" />
        </Form.Item>

        <Form.Item
          name="department_id"
          label="Department"
        >
          <Select
            placeholder="Select department (optional)"
            allowClear
            options={departmentOptions}
          />
        </Form.Item>

        <Form.Item
          name="document_type"
          label="Document Type"
        >
          <Input placeholder="Enter document type (optional)" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
        >
          <Input placeholder="Enter status (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDocumentModal;


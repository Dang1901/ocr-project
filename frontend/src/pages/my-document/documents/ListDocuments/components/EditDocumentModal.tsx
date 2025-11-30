import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { useUpdateDocument } from '@/hooks/mutations/document/useUpdateDocument';
import { useDepartments } from '@/hooks/queries/department/useDepartments';
import { useDepartmentTypes } from '@/hooks/queries/department/useDepartmentTypes';
import { usePagination } from '@/hooks/common/usePagination';
import type { Document, DocumentUpdatePayload } from '@/types/document.types';

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

  const { data: departmentTypes } = useDepartmentTypes({
    page,
    pageSize: 100, // Get all department types
  });

  const departmentOptions = useMemo(
    () =>
      (departments || []).map((department: any) => ({
        label: department.name,
        value: department.id,
      })),
    [departments],
  );

  const departmentTypeOptions = useMemo(
    () =>
      (departmentTypes || []).map((departmentType: any) => ({
        label: departmentType.name,
        value: departmentType.id,
      })),
    [departmentTypes],
  );

  useEffect(() => {
    if (open && document) {
      const departmentType = departmentTypes?.find(
        (dt: any) => dt.code === document.document_type
      );
      
      form.setFieldsValue({
        filename: document.filename,
        file_path: document.file_path,
        department_id: document.department_id,
        department_type_id: departmentType?.id,
        document_type: document.document_type,
        status: document.status,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, document, form, departmentTypes]);

  const handleSubmit = async () => {
    if (!document) return;
    
    try {
      const values = await form.validateFields();
      
      const selectedDepartmentType = departmentTypes?.find(
        (dt: any) => dt.id === values.department_type_id
      );
      
      const documentData: DocumentUpdatePayload = {
        filename: values.filename,
        file_path: values.file_path,
        department_id: values.department_id,
        document_type: selectedDepartmentType?.code || values.document_type, 
        status: values.status,
      };
      
      updateDocumentMutation.mutate({
        documentId: document.id,
        documentData,
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
          name="department_type_id"
          label="Department Type"
          rules={[
            { required: true, message: 'Please select department type' },
          ]}
        >
          <Select
            placeholder="Select department type"
            options={departmentTypeOptions}
          />
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


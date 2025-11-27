import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateDocument } from '@/hooks/mutations/document/useCreateDocument';
import { useDepartments } from '@/hooks/queries/department/useDepartments';
import { useDepartmentTypes } from '@/hooks/queries/department/useDepartmentTypes';
import { usePagination } from '@/hooks/common/usePagination';

interface CreateDocumentModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const { page, pageSize } = usePagination();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  const createDocumentMutation = useCreateDocument({
    showToast: true,
    onSuccess: () => {
      form.resetFields();
      setFileList([]);
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Check if file is uploaded
      if (fileList.length === 0) {
        message.error('Please upload a file');
        return;
      }

      // Create FormData
      const formData = new FormData();
      const file = fileList[0].originFileObj;
      if (file) {
        formData.append('file', file);
      }
      
      if (values.filename) {
        formData.append('filename', values.filename);
      }
      
      if (values.department_id) {
        formData.append('department_id', values.department_id);
      }
      
      // Get department type code from selected department type
      const selectedDepartmentType = departmentTypes?.find((dt: any) => dt.id === values.department_type_id);
      if (selectedDepartmentType) {
        formData.append('document_type', selectedDepartmentType.code);
      }
      
      if (values.status) {
        formData.append('status', values.status);
      }

      createDocumentMutation.mutate(formData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleFileChange = (info: any) => {
    let newFileList = [...info.fileList];
    
    // Limit to 1 file
    newFileList = newFileList.slice(-1);
    
    // Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto upload
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  return (
    <Modal
      title="Create Document"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={createDocumentMutation.isPending}
      okText="Create"
      cancelText="Cancel"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="file"
          label="Upload File"
          rules={[
            { required: true, message: 'Please upload a file' },
          ]}
        >
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            maxCount={1}
          >
            <button type="button" style={{ border: 0, background: 'none' }}>
              <UploadOutlined /> Click to Upload
            </button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="filename"
          label="Filename"
          rules={[
            { max: 255, message: 'Filename must be less than 255 characters' },
          ]}
          tooltip="Optional: Custom filename. If not provided, the uploaded file name will be used."
        >
          <Input placeholder="Enter custom filename (optional)" />
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

export default CreateDocumentModal;


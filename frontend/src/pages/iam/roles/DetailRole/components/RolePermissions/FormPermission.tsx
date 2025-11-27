import React, { useEffect, useState } from "react";
import { Form, Select, message, Typography, Space, Button } from "antd";
import { useFeatures } from "@/hooks/queries/feature/useFeatures";
import { useGetOperationsByFeature } from "@/hooks/queries/permission/useGetOperationsByFeature";
import { useGetExistingPermissionsByRoleCode } from "@/hooks/queries/permission/useGetExistingPermissionsByRoleCode";
import { usePagination } from "@/hooks/common/usePagination";

const { Text } = Typography;

type Props = {
  mode: "create" | "update";
  initialValues?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  roleId: string;
  roleCode: string;
  loading?: boolean;
};

interface PermissionData {
  role_id: string;
  feature_id: string;
  operation: string;
}

export const FormPermission: React.FC<Props> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  roleId,
  roleCode,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [featureOptions, setFeatureOptions] = useState<{ label: string; value: string }[]>([]);
  const [operationOptions, setOperationOptions] = useState<{ label: string; value: string; disabled?: boolean }[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("");
  const { page: listPage, pageSize: listPageSize } = usePagination(1, 100);

  const { data: features } = useFeatures({ q: "", page: listPage, pageSize: listPageSize });
  const { data: operations } = useGetOperationsByFeature(selectedFeatureId);
  const { data: existingPermissionsByRoleCode, refetch: refetchExistingPermissions } = useGetExistingPermissionsByRoleCode(roleCode, listPage, listPageSize, selectedFeatureId);
  
  // For update mode, we still need existingPermissions
  const existingPermissions = mode === "update" ? existingPermissionsByRoleCode : undefined;

  useEffect(() => {
    if (features) {
      setFeatureOptions(
        features.map((feature: { id: string; name: string }) => ({
          label: feature.name,
          value: feature.id,
        }))
      );
    }
  }, [features]);

  useEffect(() => {
    if (operations) {
      const permissionsToCheck = mode === "create" ? existingPermissionsByRoleCode : existingPermissions;
      const usedOperations = permissionsToCheck?.map((perm: any) => perm.operation) || [];
      const hasExistingPermissions = Boolean(permissionsToCheck && permissionsToCheck.length > 0);
      
      setOperationOptions(operations.map(op => {
        const isDisabled = hasExistingPermissions && usedOperations.includes(op.operation);
        return {
          label: op.operation,
          value: op.operation,
          disabled: isDisabled
        };
      }));
    } else {
      setOperationOptions([]);
    }
  }, [operations, existingPermissionsByRoleCode, selectedFeatureId, mode, existingPermissions]);

  // Set initial values for update mode
  useEffect(() => {
    if (initialValues && mode === "update") {
      setSelectedFeatureId(initialValues.feature_id || "");
      form.setFieldsValue(initialValues);
    } else if (mode === "create") {
      // Reset form for create mode
      form.resetFields();
      setSelectedFeatureId("");
    }
  }, [initialValues, mode, form]);

  // Refetch existing permissions when component mounts (for create mode)
  useEffect(() => {
    if (mode === "create" && selectedFeatureId) {
      refetchExistingPermissions();
    }
  }, [mode, selectedFeatureId, refetchExistingPermissions]);

  // Reset form when component unmounts or when modal closes
  useEffect(() => {
    return () => {
      // Cleanup function - reset form when component unmounts
      form.resetFields();
      setSelectedFeatureId("");
    };
  }, [form]);

  const checkForDuplicate = (values: any) => {
    const permissionsToCheck = mode === "create" ? existingPermissionsByRoleCode : existingPermissions;
    
    if (!permissionsToCheck || permissionsToCheck.length === 0) {
      return false; 
    }
    
    const operations = Array.isArray(values.operation) ? values.operation : [values.operation];
    const isDuplicate = operations.some((operation: string) => 
      permissionsToCheck.some((perm: any) => 
        perm.feature_id === values.feature_id && 
        perm.operation === operation
      )
    );
    
    return isDuplicate;
  };

  // Check if current form values would create a duplicate
  const checkCurrentDuplicate = () => {
    const currentValues = form.getFieldsValue();
    if (currentValues.feature_id && currentValues.operation) {
      return checkForDuplicate(currentValues);
    }
    return false;
  };

  // Get duplicate operations for display
  const getDuplicateOperations = () => {
    const currentValues = form.getFieldsValue();
    if (!currentValues.feature_id || !currentValues.operation) {
      return [];
    }

    const permissionsToCheck = mode === "create" ? existingPermissionsByRoleCode : existingPermissions;
    if (!permissionsToCheck || permissionsToCheck.length === 0) {
      return [];
    }

    const operations = Array.isArray(currentValues.operation) ? currentValues.operation : [currentValues.operation];
    return operations.filter((operation: string) => 
      permissionsToCheck.some((perm: any) => 
        perm.feature_id === currentValues.feature_id && 
        perm.operation === operation
      )
    );
  };

  const handleSubmit = (values: any) => {
    if (checkForDuplicate(values)) {
      const duplicateOps = getDuplicateOperations();
      const duplicateOpsText = duplicateOps.length > 0 ? duplicateOps.join(', ') : 'selected operations';
      message.error(`These operations already exist for the selected role and feature combination: ${duplicateOpsText}`);
      return;
    }
    
    // Handle multiple operations - create separate permission for each operation
    const operations = Array.isArray(values.operation) ? values.operation : [values.operation];
    const permissionsToCreate: PermissionData[] = operations.map((operation: string) => ({
      role_id: roleId,
      feature_id: values.feature_id,
      operation: operation
    }));
    
    // Submit all permissions
    if (mode === "create") {
      // For create mode, submit all permissions as an array
      onSubmit({ permissions: permissionsToCreate });
    } else {
      // For update mode, submit single permission
      onSubmit(permissionsToCreate[0]);
    }
    
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={<Text strong style={{ fontSize: 13 }}>Role</Text>}
      >
        <Select 
          value={roleCode}
          disabled
          style={{ backgroundColor: '#f5f5f5' }}
        />
      </Form.Item>

      <Form.Item
        name="feature_id"
        label={<Text strong style={{ fontSize: 13 }}>Feature</Text>}
        rules={[{ required: true, message: "Please select a feature" }]}
      >
        <Select 
          placeholder="Please select a feature" 
          options={featureOptions}
          onChange={(value) => {
            setSelectedFeatureId(value);
            // Reset operation when feature changes
            form.setFieldsValue({ operation: undefined });
            // Clear any existing validation errors
            form.setFields([{ name: 'operation', errors: [] }]);
          }}
        />
      </Form.Item>

      <Form.Item
        name="operation"
        label={<Text strong style={{ fontSize: 13 }}>Operations</Text>}
        rules={[{ required: true, message: "Please select at least one operation" }]}
        validateTrigger={['onChange', 'onBlur']}
      >
        <Select 
          mode="multiple"
          placeholder="Please select operations" 
          options={operationOptions}
          disabled={!selectedFeatureId}
          onChange={() => {
            // Only validate when user actually selects something
            setTimeout(() => form.validateFields(['operation']), 0);
          }}
          onBlur={() => {
            // Validate on blur to show error if field is empty
            form.validateFields(['operation']);
          }}
          optionRender={(option) => {
            const isDisabled = (option as any).disabled;
            return (
              <div style={{ 
                color: isDisabled ? '#999' : 'inherit',
                fontStyle: isDisabled ? 'italic' : 'normal'
              }}>
                {option.label} {isDisabled && '(Already used for this role + feature)'}
              </div>
            );
          }}
        />
      </Form.Item>

      {checkCurrentDuplicate() && (
        <div style={{ 
          color: '#ff4d4f', 
          fontSize: '14px', 
          padding: '8px 12px', 
          background: '#fff2f0', 
          border: '1px solid #ffccc7', 
          borderRadius: '6px',
          marginBottom: 16
        }}>
          ⚠️ These operations already exist for the selected role and feature combination: {getDuplicateOperations().join(', ')}
        </div>
      )}

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          {onCancel && (
            <Button
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            disabled={checkCurrentDuplicate() || loading}
            loading={loading}
          >
            {mode === "create" ? "Add Permission" : "Update Permission"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};


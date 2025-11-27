import React, { useState } from "react";
import { Table } from "antd";
import { colors } from "@config/colors";
import { usePermissions } from "@/hooks/queries/permission/usePermissions";
import { permissionColumns } from "./tableConfig";
import { useCreatePermissions } from "@/hooks/mutations/permission/useCreatePermissions";
import CreatePermission from "./CreatePermission";
import UpdatePermission from "./UpdatePermission";
import DeletePermission from "./DeletePermission";
import { usePagination } from "@/hooks/common/usePagination";

interface RolePermissionsProps {
  roleCode: string;
  roleId: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({
  roleCode,
  roleId,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<any[]>([]);
  const [enableEdit, setEnableEdit] = useState(false);
  const [addLoadingId, setAddLoadingId] = useState<string | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 50);
  
  const createPermissionMutation = useCreatePermissions({
    showToast: true,
    onSuccess: () => {
      refetch();
      setAddLoadingId(null);
    },
  });

  // Fetch role permissions
  const {
    data: permissions,
    isLoading: permissionsLoading,
    total,
    refetch,
  } = usePermissions({
    role_code: roleCode,
    page,
    pageSize,
  });

  const handleDelete = (permission: any[]) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = async (permission: any[]) => {
    if (permission.length === 0) return;
    if (permission.length === 1) setAddLoadingId(permission[0]?.id);
    if (permission.length > 1) setAddLoadingId(permission[0]?.feature_code);
    
    const datas = [];
    for (const p of permission) {
      datas.push({
        role_id: roleId,
        feature_id: p.feature_id,
        operation: p.operation,
      });
    }
    
    await createPermissionMutation.mutateAsync(datas);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedPermission([]);
    refetch();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedPermission([]);
    refetch();
  };

  const canEditPermissions = true; // TODO: Add permission check

  return (
    <>
      <Table
        columns={permissionColumns(
          handleDelete,
          handleAdd,
          () => setEnableEdit(!enableEdit),
          enableEdit,
          addLoadingId,
          canEditPermissions
        )}
        dataSource={permissions || []}
        rowKey="feature_code"
        loading={permissionsLoading}
        pagination={false}
        style={{
          flex: 1,
          minHeight: 0,
          border: `1px solid ${colors.tableBorder}`,
          borderRadius: 0,
          overflow: "auto",
          fontSize: "13px",
          backgroundColor: colors.white,
        }}
        scroll={{ y: "100%" }}
        tableLayout="auto"
      />

      {/* Create Permission Modal */}
      <CreatePermission
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        roleId={roleId}
        roleCode={roleCode}
      />

      {/* Update Permission Modal */}
      {selectedPermission && selectedPermission.length > 0 && (
        <UpdatePermission
          open={isUpdateModalOpen}
          onCancel={() => {
            setIsUpdateModalOpen(false);
            setSelectedPermission([]);
          }}
          onSuccess={handleUpdateSuccess}
          permission={selectedPermission}
        />
      )}

      {/* Delete Permission Modal */}
      {selectedPermission && selectedPermission.length > 0 && (
        <DeletePermission
          open={isDeleteModalOpen}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setSelectedPermission([]);
          }}
          onSuccess={handleDeleteSuccess}
          permission={selectedPermission}
        />
      )}
    </>
  );
};

export default RolePermissions;


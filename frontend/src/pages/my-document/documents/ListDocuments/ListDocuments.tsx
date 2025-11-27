import React, { useState, useMemo, useCallback } from "react";
import { Table, Pagination, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { colors } from "@config/colors";
import { usePagination } from "@/hooks/common/usePagination";
import { useDebounce } from "@/hooks/common/useDebounce";
import { usePermissionError } from "@/hooks/common/usePermissionError";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import { useDocuments } from "@/hooks/queries/document/useDocuments";
import { useDeleteDocument } from "@/hooks/mutations/document/useDeleteDocument";
import HeaderInformation from "@components/common/HeaderInformation";
import InputFilter from "@components/common/InputFilter";
import PermissionWarningBanner from "@components/common/PermissionWarningBanner";
import { MainContainer, FilterContainer } from "@/components/layout/MainContainer.styles";
import { buildDocumentColumns } from "./tableConfig";
import CreateDocumentModal from "./components/CreateDocumentModal";
import EditDocumentModal from "./components/EditDocumentModal";
import type { Document } from "@/api/document.api";

const ListDocuments: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();
  
  // Check permission trước khi gọi API
  const hasListPermission = checkPermission(permissions, "DOCUMENT", "list_documents");
  const hasCreatePermission = checkPermission(permissions, "DOCUMENT", "create_document");

  const documentsQuery = useDocuments({
    q: debouncedSearch || undefined,
    page,
    pageSize,
  }, hasListPermission);

  const documents = documentsQuery.data || [];
  const total = documentsQuery.total || 0;
  const isLoading = documentsQuery.isLoading || isCheckingPermission;
  const refetch = documentsQuery.refetch;

  // Check permission error
  const permissionError = usePermissionError(documentsQuery.error);

  const deleteDocumentMutation = useDeleteDocument({
    showToast: true,
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = useCallback((documentId: string, filename: string) => {
    Modal.confirm({
      title: 'Delete Document',
      content: `Are you sure you want to delete "${filename}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteDocumentMutation.mutate(documentId);
      },
    });
  }, [deleteDocumentMutation]);

  const handleEdit = useCallback((documentId: string) => {
    const document = documents?.find((d: any) => d.id === documentId);
    if (document) {
      setSelectedDocument(document);
      setIsEditModalVisible(true);
    }
  }, [documents]);

  const handleCreate = useCallback(() => {
    setIsCreateModalVisible(true);
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditModalVisible(false);
    setSelectedDocument(null);
    refetch();
  };

  const columns = useMemo(
    () =>
      buildDocumentColumns({
        handleEdit,
        handleDelete,
        permissions,
      }),
    [handleEdit, handleDelete, permissions]
  );

  // Check if user has permission
  const hasPermission = hasListPermission && !permissionError.isPermissionDenied;
  const showWarning = !isCheckingPermission && !hasPermission;

  return (
    <MainContainer>
      {showWarning && (
        <PermissionWarningBanner message="You do not have sufficient permissions to view this page!" />
      )}
      
      {!showWarning && (
        <>
          <HeaderInformation
            breadcrumbs={[
              { label: "Documents" },
            ]}
            title="Document Management"
            description="Manage documents and files"
            action={
              hasCreatePermission && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
                >
                  Add Document
                </Button>
              )
            }
          />
      
          <FilterContainer>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, width: '100%' }}>
              <InputFilter
                label="Quick search"
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  if (value === "") {
                    setPage(1);
                  }
                }}
                placeholder="Search by filename or document type..."
                width={300}
                onPressEnter={() => {
                  setPage(1);
                }}
              />
            </div>
          </FilterContainer>

          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            loading={isLoading}
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
            scroll={{ x: "max-content" }}
            tableLayout="auto"
          />

          <Pagination
            align="start"
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            onShowSizeChange={(_, size) => setPageSize(size)}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
            style={{ 
              backgroundColor: colors.white, 
              padding: "16px", 
              borderRadius: 0,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
          />

          <CreateDocumentModal
            open={isCreateModalVisible}
            onCancel={() => setIsCreateModalVisible(false)}
            onSuccess={handleCreateSuccess}
          />

          <EditDocumentModal
            open={isEditModalVisible}
            document={selectedDocument}
            onCancel={() => {
              setIsEditModalVisible(false);
              setSelectedDocument(null);
            }}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </MainContainer>
  );
};

export default ListDocuments;


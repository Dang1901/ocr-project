import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Spin, Tag, Button, Card, Tabs, Alert } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useGetDocumentById } from "@/hooks/queries/document/useGetDocumentById";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import { usePermissionError } from "@/hooks/common/usePermissionError";
import HeaderInformation from "@/components/common/HeaderInformation";
import PermissionWarningBanner from "@/components/common/PermissionWarningBanner";
import { MainContainer } from "@/components/layout/MainContainer.styles";
import InvoiceJsonForm from "@/components/document/InvoiceJsonForm";

const DetailDocument: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [activePage, setActivePage] = useState<number>(1);
  
  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();
  
  // Check permission trước khi gọi API
  const hasGetPermission = checkPermission(permissions, "OCR", "get_ocr_result");
  
  // Fetch document details with OCR results
  const { data: documentResult, isLoading: documentLoading, error: documentError } = useGetDocumentById(documentId || null, hasGetPermission);
  
  // Check permission error
  const permissionError = usePermissionError(documentError);
  
  // Extract document and pages from result
  const document = useMemo(() => documentResult?.document, [documentResult]);
  const pages = useMemo(() => documentResult?.pages || [], [documentResult]);
  const totalPages = useMemo(() => documentResult?.total_pages_count || 0, [documentResult]);
  
  // Set active page to first page when pages are loaded
  useEffect(() => {
    if (pages.length > 0 && activePage > pages.length) {
      setActivePage(pages[0].page_number);
    } else if (pages.length > 0 && !pages.find(p => p.page_number === activePage)) {
      setActivePage(pages[0].page_number);
    }
  }, [pages, activePage]);
  
  // Get current page data
  const currentPageData = useMemo(() => {
    return pages.find(p => p.page_number === activePage);
  }, [pages, activePage]);
  
  // Get JSON data from current page
  const jsonData = useMemo(() => {
    return currentPageData?.llm_json || null;
  }, [currentPageData]);
  
  const handleDataChange = (updatedData: any) => {
    // Note: Data changes are handled locally. 
    // If needed, can implement API call to save updated data here
    // Example: updateDocumentMutation.mutate({ documentId, pageNumber: activePage, llm_json: updatedData })
  };
  
  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const isLoading = documentLoading || isCheckingPermission;

  if (isLoading) {
    return (
      <MainContainer>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <Spin size="large" />
        </div>
      </MainContainer>
    );
  }

  // Show permission warning if no permission
  if (!hasGetPermission) {
    return (
      <MainContainer>
        <PermissionWarningBanner
          message="You don't have permission to view document details"
        />
      </MainContainer>
    );
  }

  if (documentError || !document) {
    return (
      <MainContainer>
        <div style={{ padding: 32, textAlign: "center" }}>
          <p>Failed to load document details</p>
          <Button onClick={() => window.history.back()} style={{ marginTop: 16 }}>
            Back to Documents
          </Button>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "Documents", to: "/documents" },
          { label: document.filename },
        ]}
        title={document.filename}
        icon={<FileTextOutlined />}
        description={
          <div style={{ display: "flex", gap: 20, marginTop: 15, flexWrap: "wrap" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Document Type: </div>
              <Tag color="blue">
                {document.document_type || 'N/A'}
              </Tag>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Department: </div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {document.department?.name || 'N/A'}
              </div>
            </div>
            {document.owner && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Owner: </div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>
                  {document.owner}
                </div>
              </div>
            )}
            {document.created_at && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Created At: </div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>
                  {document.created_at ? new Date(document.created_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
            )}
          </div>
        }
      />

      <Card style={{ marginTop: 16 }}>
        {totalPages > 1 && (
          <Tabs
            activeKey={activePage.toString()}
            onChange={(key) => handlePageChange(Number(key))}
            items={pages.map((page) => ({
              key: page.page_number.toString(),
              label: `Page ${page.page_number}${page.status === 'done' ? ' ✓' : page.status === 'processing' ? ' ⏳' : page.status === 'failed' ? ' ✗' : ''}`,
              children: null,
            }))}
            style={{ marginBottom: 16 }}
          />
        )}
        
        {currentPageData?.status === 'processing' && (
          <Alert
            message="Processing"
            description="This page is currently being processed. Please wait..."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {currentPageData?.status === 'pending' && (
          <Alert
            message="Pending"
            description="This page is pending processing."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {currentPageData?.status === 'failed' && (
          <Alert
            message="Failed"
            description="Failed to process this page."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {currentPageData?.status === 'done' && jsonData ? (
          <InvoiceJsonForm
            jsonData={jsonData}
            pageNumber={activePage}
            totalPages={totalPages}
            onDataChange={handleDataChange}
            onPageChange={handlePageChange}
          />
        ) : currentPageData?.status === 'done' && !jsonData ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>No JSON data available for this page</p>
          </div>
        ) : null}
      </Card>
    </MainContainer>
  );
};

export default DetailDocument;

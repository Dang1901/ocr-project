import React from "react";
import { SwapRightOutlined, ScanOutlined } from "@ant-design/icons";
import { OCRContent, ConvertButton } from "./OCR.styles";
import HeaderInformation from "@components/common/HeaderInformation";
import PermissionWarningBanner from "@/components/common/PermissionWarningBanner";
import { useGetUserPermissions, hasPermission as checkPermission } from "@/hooks/common/useGetUserPermissions";
import OCRFooterComponent from "./components/OCRFooter";
import { PDFUploader } from "./components/PDFUploader";
import { PDFViewer } from "./components/PDFViewer";
import { ExtractedDataView } from "./components/ExtractedDataView";
import { useOCR } from "./hooks/useOCR";
import "./OCR.css";
import { Card, Row, Col, Spin } from "antd";
import { MainContainer } from "@/components/layout/MainContainer.styles";

const OCR: React.FC = () => {
  // Use OCR hook for all business logic
  const {
    extractProgress,
    pdfLoaded,
    file,
    fileUrl,
    loading,
    documentId,
    ocrPages,
    currentPage,
    totalPages,
    loadingResults,
    handleConvert,
    handleFileUpload,
    handleRemoveFile,
    handleJsonDataChange,
    handleJsonPageChange,
    handleApprove,
    getCurrentPageJsonData,
  } = useOCR();

  // Get all user permissions
  const { permissions, isLoading: isCheckingPermission } = useGetUserPermissions();

  // Check permission trước khi sử dụng OCR
  const hasUploadPermission = checkPermission(permissions, "OCR", "upload_file_for_ocr");

  if (isCheckingPermission) {
    return (
      <MainContainer>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <Spin size="large" />
        </div>
      </MainContainer>
    );
  }

  // Show permission warning if no permission
  if (!hasUploadPermission) {
    return (
      <MainContainer>
        <PermissionWarningBanner
          message="You do not have sufficient permissions to view this page!"
        />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "OCR" },
        ]}
        title="OCR"
        description="OCR: Optical Character Recognition"
        icon={<ScanOutlined />}
      />

      <Card style={{ border: "none", height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 0 }}>
        <OCRContent style={{ padding: 0 }}>
          <Row gutter={16} style={{ flex: 1, overflow: "hidden" }}>
            <Col xs={24} lg={14} style={{ height: "100%" }}>
              {!file ? (
                <PDFUploader onFileUpload={handleFileUpload} />
              ) : (
                <PDFViewer
                  fileUrl={fileUrl}
                  fileName={file?.name}
                  fileSize={file?.size}
                  onRemove={handleRemoveFile}
                />
              )}
            </Col>

            <Col xs={24} lg={2} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ConvertButton
                onClick={handleConvert}
                disabled={!pdfLoaded || loading}
                loading={loading}
              >
                <SwapRightOutlined style={{ fontSize: "20px", marginRight: "8px" }} />
                Convert
              </ConvertButton>
            </Col>

            <Col xs={24} lg={8} style={{ height: "100%", display: "flex" }}>
              <ExtractedDataView
                loading={loading}
                loadingResults={loadingResults}
                ocrPages={ocrPages}
                documentId={documentId}
                currentPage={currentPage}
                totalPages={totalPages}
                jsonData={getCurrentPageJsonData()}
                onDataChange={(updatedData) => handleJsonDataChange(currentPage, updatedData)}
                onPageChange={handleJsonPageChange}
              />
            </Col>
          </Row>
        </OCRContent>


      </Card>
      <OCRFooterComponent
        extractProgress={extractProgress}
        extractedData={ocrPages.length > 0 ? "Data available" : ""}
        onApprove={handleApprove}
      />
    </MainContainer>
  );
};

export default OCR;

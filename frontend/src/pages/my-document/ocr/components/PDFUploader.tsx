import React from "react";
import { Upload, Typography } from "antd";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;

interface PDFUploaderProps {
  onFileUpload: (file: UploadFile) => false | typeof Upload.LIST_IGNORE;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileUpload }) => {
  return (
    <Upload.Dragger
      accept=".pdf"
      multiple={false}
      showUploadList={false}
      beforeUpload={onFileUpload}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "60px 40px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
        border: "2px dashed #d9d9d9",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px", color: "#1A3636" }}>📄</div>
      <Text strong style={{ fontSize: "16px", color: "#1A3636", display: "block", marginBottom: "8px" }}>
        Click or drag PDF file to convert
      </Text>
      <Text type="secondary" style={{ fontSize: "14px" }}>Support single PDF upload</Text>
    </Upload.Dragger>
  );
};


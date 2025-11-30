import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  onRemove: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  fileName,
  fileSize,
  onRemove,
}) => {
  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#1A3636" }}>PDF Viewer</span>
          <Text
            style={{
              cursor: "pointer",
              color: "#f5222d",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
            onClick={onRemove}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Remove
          </Text>
        </div>
      }
      bordered
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderRadius: 0,
      }}
      bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}
    >
      <div
        style={{
          flex: 1,
          background: "#1a1a1a",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          border: "1px solid #333",
        }}
      >
        <iframe
          src={fileUrl}
          title="OCR Preview"
          style={{
            width: "100%",
            height: "100%",
            border: "0",
            minHeight: "400px",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "#f5f7fa",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Text strong style={{ color: "#1A3636" }}>
            {fileName}
          </Text>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            ({fileSize ? (fileSize / 1024 / 1024).toFixed(2) : "0.00"} MB)
          </Text>
        </div>
      </div>
    </Card>
  );
};

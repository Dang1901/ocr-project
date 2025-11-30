import React from "react";
import { Card, Spin } from "antd";
import InvoiceJsonForm from "./InvoiceJsonForm";
import type { InvoiceJsonData } from "../types/ocr.types";

interface ExtractedDataViewProps {
  loading: boolean;
  loadingResults: boolean;
  ocrPages: Array<{ page_number: number; llm_json: InvoiceJsonData | null; status: string }>;
  documentId: string | null;
  currentPage: number;
  totalPages: number;
  jsonData: InvoiceJsonData | null;
  onDataChange: (updatedData: InvoiceJsonData) => void;
  onPageChange: (newPage: number) => void;
}

export const ExtractedDataView: React.FC<ExtractedDataViewProps> = ({
  loading,
  loadingResults,
  ocrPages,
  documentId,
  currentPage,
  totalPages,
  jsonData,
  onDataChange,
  onPageChange,
}) => {
  return (
    <Card
      title={
        <span style={{ fontSize: "16px", fontWeight: 600, color: "#1A3636" }}>
          Extracted JSON Data {ocrPages.length > 0 ? `(${totalPages} pages)` : ""}
        </span>
      }
      bordered
      style={{
        flex: 1,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      bodyStyle={{ 
        padding: 0, 
        flex: 1, 
        background: "#f5f7fa",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {loading || loadingResults ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin />
            <p>{loading ? "Uploading and processing PDF..." : "Loading OCR results..."}</p>
          </div>
        ) : ocrPages.length > 0 ? (
          <InvoiceJsonForm
            jsonData={jsonData}
            pageNumber={currentPage}
            totalPages={totalPages}
            onDataChange={onDataChange}
            onPageChange={onPageChange}
          />
        ) : documentId ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
            <Spin />
            <p>Waiting for OCR results...</p>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
            <p>JSON data will appear here</p>
            <p style={{ fontSize: 12 }}>Upload PDF and click Convert to start</p>
          </div>
        )}
      </div>
    </Card>
  );
};


import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Tag, Button, Card } from "antd";
import { useGetDocumentById } from "@/hooks/queries/document/useGetDocumentById";
import HeaderInformation from "@/components/common/HeaderInformation";
import { MainContainer } from "@/components/layout/MainContainer.styles";
import InvoiceJsonForm from "@/components/document/InvoiceJsonForm";

const DetailDocument: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  
  // Fetch document details
  const { data: document, isLoading: documentLoading, error: documentError } = useGetDocumentById(documentId || null);
  
  // JSON data từ document (có thể lấy từ document.extracted_data hoặc API riêng)
  // Tạm thời dùng sample data bạn cung cấp
  const [jsonData, setJsonData] = useState<any>({
    "buyer": {
      "cccd": "",
      "name": "",
      "address": "KCN Việt Hưng, Phường Việt Hưng, Tỉnh Quảng Ninh, Việt Nam",
      "passport": "",
      "tax_code": "5702056771",
      "unit_name": "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHIỆP Ô TÔ VIỆT NAM",
      "payment_method": "Chuyển khoản"
    },
    "items": [
      {
        "stt": "1",
        "name": "Vận đơn STE31101901",
        "unit": "Tờ khai",
        "amount": "1440000",
        "quantity": "1.00",
        "unit_price": "1440000"
      },
      {
        "stt": "2",
        "name": "Vận đơn STE31102205",
        "unit": "Tờ khai",
        "amount": "1440000",
        "quantity": "1.00",
        "unit_price": "1440000"
      },
      {
        "stt": "3",
        "name": "Vận đơn MTE25090359",
        "unit": "Tờ khai",
        "amount": "1440000",
        "quantity": "1.00",
        "unit_price": "1440000"
      },
      {
        "stt": "4",
        "name": "Vận đơn BKK-00010922",
        "unit": "Cont",
        "amount": "7200000",
        "quantity": "1.00",
        "unit_price": "7200000"
      },
      {
        "stt": "5",
        "name": "Vận đơn SRTKFL2508038",
        "unit": "Cont",
        "amount": "7200000",
        "quantity": "1.00",
        "unit_price": "7200000"
      }
    ],
    "seller": {
      "fax": "",
      "name": "CÔNG TY CỔ PHẦN DỊCH VỤ VÀ HẠ TẦNG Ô TÔ THÀNH CÔNG",
      "phone": "0368 966 46",
      "address": "Khu công nghiệp Gián Khẩu, Xã Gia Trấn, Tỉnh Ninh Bình, Việt Nam",
      "tax_code": "2700872578"
    },
    "totals": {
      "total": "20217600",
      "subtotal": "18720000",
      "vat_rate": "8%",
      "vat_amount": "1497600",
      "total_in_words": "Hai mươi triệu hai trăm mười bảy nghìn sáu trăm đồng./."
    },
    "invoice": {
      "date": "30/09/2025",
      "title": "HÓA ĐƠN GIÁ TRỊ GIA TĂNG (VAT INVOICE)",
      "number": "0001554",
      "serial": "1C25TMS",
      "cqt_code": "00EA0C27ED60D541B8B88327F6DC56B2CC"
    }
  });

  const handleDataChange = (updatedData: any) => {
    setJsonData(updatedData);
    // TODO: Có thể gọi API để save updated data
    console.log("Updated JSON data:", updatedData);
  };

  if (documentLoading) {
    return (
      <MainContainer>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <Spin size="large" />
        </div>
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
        <InvoiceJsonForm
          jsonData={jsonData}
          onDataChange={handleDataChange}
        />
      </Card>
    </MainContainer>
  );
};

export default DetailDocument;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SwapRightOutlined } from "@ant-design/icons";
import { OCRContent, ConvertButton } from "./OCR.styles";
import HeaderInformation from "@components/common/HeaderInformation";
import ExtractedData from "./components/ExtractedData";
import OCRFooterComponent from "./components/OCRFooter";
import "./OCR.css";
import { Card, message, Row, Col, Spin, Typography, Upload } from "antd";
import { MainContainer } from "@/components/layout/MainContainer.styles";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;

const OCR: React.FC = () => {
  const [extractProgress, setExtractProgress] = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [extractedData, setExtractedData] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConvert = () => {
    if (!file) {
      message.warning("Vui lòng tải lên file PDF trước");
      return;
    }

    setExtractProgress(10);
    setExtractedData("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const baseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
    const uploadUrl = `${baseUrl}/api/v1/ocr/upload`.replace(/\/\/api/, "/api");

    axios
      .post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      })
      .then((response) => {
        const status = response.data?.status;
        const payload = response.data?.data;
        if (status !== "success" || !payload) {
          throw new Error(response.data?.message || "OCR failed");
        }

        setExtractedData(JSON.stringify(payload, null, 2));
        message.success(`Xử lý thành công ${payload.total_pages || 0} trang!`);
        setExtractProgress(100);
      })
      .catch((error) => {
        console.error("OCR error:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            message.error("Yêu cầu timeout, hãy thử lại.");
          } else if (error.response) {
            message.error(`Lỗi từ server: ${error.response.status}`);
          } else if (error.request) {
            message.error("Không thể kết nối đến backend. Đảm bảo server đang chạy tại http://localhost:8000");
          } else {
            message.error(`Lỗi: ${error.message}`);
          }
        } else {
          message.error("Đã có lỗi xảy ra trong quá trình xử lý");
        }
        setExtractProgress(0);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFileUpload = (file: UploadFile) => {
    const originFile = file.originFileObj as File | undefined;
    const candidate = originFile || (file as unknown as File);
    const isPdf =
      candidate?.type === "application/pdf" ||
      candidate?.name?.toLowerCase().endsWith(".pdf");

    if (!candidate || !isPdf) {
      message.error("Chỉ cho phép file PDF");
      return Upload.LIST_IGNORE;
    }

    const url = URL.createObjectURL(candidate);
    setFileUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return url;
    });

    setFile(candidate);
    setPdfLoaded(true);
    setExtractedData("");
    setExtractProgress(0);
    return false;
  };

  const handleApprove = () => {
    // Handle approve action
    if (!extractedData) {
      message.warning("Chưa có dữ liệu để duyệt");
      return;
    }
    message.success("Dữ liệu đã được duyệt");
    console.log("Approved data:", extractedData);
  };

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "OCR" },
        ]}
        title="OCR"
        description="OCR: Optical Character Recognition"
      />

      <Card style={{ border: "none", height: "100%"}}>
        <OCRContent style={{ padding: 0 }}>
          <Row gutter={12} style={{ flex: 1, overflow: "hidden" }}>
            <Col xs={24} lg={14} style={{ height: "100%" }}>
              <Card
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>PDF Viewer</span>
                    {file && (
                      <Text
                        style={{ cursor: "pointer", color: "#f5222d" }}
                        onClick={() => {
                          setFile(null);
                          if (fileUrl) {
                            URL.revokeObjectURL(fileUrl);
                          }
                          setFileUrl("");
                          setPdfLoaded(false);
                        }}
                      >
                        Remove
                      </Text>
                    )}
                  </div>
                }
                bordered
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
                bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                {!file ? (
                  <Upload.Dragger
                    accept=".pdf"
                    multiple={false}
                    showUploadList={false}
                    beforeUpload={handleFileUpload}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "40px",
                      borderRadius: "8px",
                      background: "#fafafa",
                    }}
                  >
                    <Text strong>Click or drag PDF file to convert</Text>
                    <Text type="secondary">Support single PDF upload</Text>
                  </Upload.Dragger>
                ) : (
                  <>
                    <div
                      style={{
                        flex: 1,
                        background: "#111",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <iframe
                        src={fileUrl}
                        title="OCR Preview"
                        style={{ width: "100%", height: "100%", border: "0", minHeight: "380px" }}
                      />
                    </div>
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Text strong>{file?.name}</Text>
                        <Text type="secondary">({file?.size ? (file.size / 1024 / 1024).toFixed(2) : "0.00"} MB)</Text>
                      </div>
                    </div>
                  </>
                )}
              </Card>
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
              <Card
                title={`Extracted JSON Data ${extractedData ? "(result)" : ""}`}
                bordered
                style={{ flex: 1, overflow: "hidden" }}
                bodyStyle={{ padding: 0, flex: 1 }}
              >
                {loading ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Spin />
                    <p>Processing PDF...</p>
                  </div>
                ) : (
                  <ExtractedData extractedData={extractedData} />
                )}
              </Card>
            </Col>
          </Row>
        </OCRContent>

        <OCRFooterComponent
          extractProgress={extractProgress}
          extractedData={extractedData}
          onApprove={handleApprove}
        />
      </Card>
    </MainContainer>
  );
};

export default OCR;

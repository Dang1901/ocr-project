import React, { useState } from "react";
import { SwapRightOutlined } from "@ant-design/icons";
import { OCRContent, ConvertButton } from "./OCR.styles";
import HeaderInformation from "@components/common/HeaderInformation";
import PDFViewer from "./components/PDFViewer";
import ExtractedData from "./components/ExtractedData";
import OCRFooterComponent from "./components/OCRFooter";
import "./OCR.css";
import { Card } from "antd";
import { MainContainer } from "@/components/layout/MainContainer.styles";

const OCR: React.FC = () => {
  const [extractProgress, setExtractProgress] = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [extractedData, setExtractedData] = useState<string>("");

  const handleConvert = () => {
    // Simulate OCR processing with smooth animation
    setExtractProgress(0);
    setExtractedData(""); // Clear previous data

    let currentProgress = 0;
    const duration = 2000; // 2 seconds total
    const steps = 60; // 60 frames for smooth animation
    const increment = 100 / steps;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      currentProgress += increment;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        // Add extracted data after animation completes
        setTimeout(() => {
          setExtractedData(
            "Sample extracted text from OCR:\n\nThis is a demonstration of OCR extracted content. The text has been successfully extracted from the uploaded document."
          );
        }, 300);
      }

      setExtractProgress(currentProgress);
    }, stepDuration);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfLoaded(true);
      // Here you would load the PDF
    }
  };

  const handleApprove = () => {
    // Handle approve action
    console.log("Approve extracted data");
  };

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
        <OCRContent>
          <PDFViewer pdfLoaded={pdfLoaded} onFileUpload={handleFileUpload} />

          <ConvertButton onClick={handleConvert} disabled={!pdfLoaded}>
            <SwapRightOutlined
              style={{ fontSize: "20px", marginRight: "8px" }}
            />
            Convert
          </ConvertButton>

          <ExtractedData extractedData={extractedData} />
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

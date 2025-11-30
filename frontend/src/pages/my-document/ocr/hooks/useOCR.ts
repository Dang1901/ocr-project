import { useState, useCallback, useEffect } from "react";
import { httpClient } from "@/api/httpClient";
import { useAppDispatch } from "@/store";
import { addToast, createToast } from "@/store/slices/toast_slice";
import type { UploadFile } from "antd/es/upload/interface";
import { Upload } from "antd";
import type { InvoiceJsonData, OcrPage, OcrUploadResponse, OcrResultResponse } from "../types/ocr.types";

interface UseOCROptions {
  onUploadSuccess?: (documentId: string, totalPages: number) => void;
  onProcessingComplete?: (pages: OcrPage[]) => void;
}

export const useOCR = (options?: UseOCROptions) => {
  const dispatch = useAppDispatch();
  
  const [extractProgress, setExtractProgress] = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [ocrPages, setOcrPages] = useState<OcrPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editedJsonData, setEditedJsonData] = useState<Record<number, InvoiceJsonData>>({});
  const [loadingResults, setLoadingResults] = useState(false);

  // Cleanup file URL on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleConvert = useCallback(() => {
    if (!file) {
      dispatch(addToast(createToast.warning("Please upload a PDF file first")));
      return;
    }

    setExtractProgress(10);
    setLoading(true);
    setDocumentId(null);
    setOcrPages([]);
    setCurrentPage(1);
    setEditedJsonData({});

    const formData = new FormData();
    formData.append("file", file);

    httpClient
      .post<OcrUploadResponse>("/ocr/upload", formData, undefined)
      .then((response) => {
        const responseData = response.data;
        const status = responseData?.status;
        const payload = responseData?.data;

        if (status !== "success" || !payload) {
          const errorMsg = responseData?.message || response.error || "OCR failed";
          throw new Error(errorMsg);
        }

        const docId = payload?.document?.id;
        const totalPagesCount = payload?.total_pages || 0;

        if (!docId) {
          throw new Error("Failed to receive document ID from server");
        }

        setDocumentId(docId);
        setTotalPages(totalPagesCount);
        setExtractProgress(100);
        dispatch(addToast(createToast.success(
          "Upload successful",
          `Successfully uploaded ${totalPagesCount} page(s)! Processing OCR...`
        )));

        options?.onUploadSuccess?.(docId, totalPagesCount);

        // Start polling to get OCR results
        setTimeout(() => {
          fetchOcrResults(docId);
        }, 2000);
      })
      .catch((error) => {
        const errorMsg = error?.error || error?.message || "An error occurred during processing";
        dispatch(addToast(createToast.error("Upload failed", errorMsg)));
        setExtractProgress(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [file, dispatch, options]);

  const fetchOcrResults = useCallback((docId: string, page: number = 1) => {
    setLoadingResults(true);
    httpClient
      .get<OcrResultResponse>(`/ocr/documents/${docId}/result`, { page, page_size: 100 })
      .then((response) => {
        const responseData = response.data;
        const status = responseData?.status;
        const payload = responseData?.data;

        if (status === "success" && payload) {
          const pages = payload.pages || [];
          const processingStatus = payload.processing_status || {};

          // Update pages list
          setOcrPages(pages);
          setCurrentPage(1);

          // Check if still processing, continue polling
          if (processingStatus.pending > 0 || processingStatus.processing > 0) {
            setTimeout(() => {
              fetchOcrResults(docId, page);
            }, 3000);
          } else {
            dispatch(addToast(createToast.success(
              "OCR processing completed",
              `OCR processing completed for ${pages.length} page(s)!`
            )));
            options?.onProcessingComplete?.(pages);
          }
        }
      })
      .catch(() => {
        // Retry after 3s
        setTimeout(() => {
          fetchOcrResults(docId, page);
        }, 3000);
      })
      .finally(() => {
        setLoadingResults(false);
      });
  }, [dispatch, options]);

  const handleFileUpload = useCallback((file: UploadFile) => {
    const originFile = file.originFileObj as File | undefined;
    const candidate = originFile || (file as unknown as File);
    const isPdf =
      candidate?.type === "application/pdf" ||
      candidate?.name?.toLowerCase().endsWith(".pdf");

    if (!candidate || !isPdf) {
      dispatch(addToast(createToast.error("Invalid file type", "Only PDF files are allowed")));
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
    setDocumentId(null);
    setOcrPages([]);
    setCurrentPage(1);
    setEditedJsonData({});
    setExtractProgress(0);
    return false;
  }, [dispatch]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl("");
    setPdfLoaded(false);
  }, [fileUrl]);

  const handleJsonDataChange = useCallback((pageNumber: number, updatedData: InvoiceJsonData) => {
    setEditedJsonData((prev) => ({
      ...prev,
      [pageNumber]: updatedData,
    }));
  }, []);

  const handleJsonPageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const handleApprove = useCallback(() => {
    if (Object.keys(editedJsonData).length === 0 && ocrPages.length === 0) {
      dispatch(addToast(createToast.warning("No data available", "No data available to approve")));
      return;
    }
    dispatch(addToast(createToast.success("Data approved", "Data has been approved")));
  }, [editedJsonData, ocrPages, dispatch]);

  // Get JSON data for current page
  const getCurrentPageJsonData = useCallback((): InvoiceJsonData | null => {
    const pageIndex = currentPage - 1;
    const ocrPage = ocrPages[pageIndex];
    
    // If edited, use edited data
    if (editedJsonData[currentPage]) {
      return editedJsonData[currentPage];
    }
    
    // If has OCR data, parse and return
    if (ocrPage?.llm_json) {
      return ocrPage.llm_json as InvoiceJsonData;
    }
    
    return null;
  }, [currentPage, ocrPages, editedJsonData]);

  return {
    // State
    extractProgress,
    pdfLoaded,
    file,
    fileUrl,
    loading,
    documentId,
    ocrPages,
    currentPage,
    totalPages,
    editedJsonData,
    loadingResults,
    
    // Handlers
    handleConvert,
    handleFileUpload,
    handleRemoveFile,
    handleJsonDataChange,
    handleJsonPageChange,
    handleApprove,
    getCurrentPageJsonData,
    
    // Setters (if needed)
    setCurrentPage,
  };
};


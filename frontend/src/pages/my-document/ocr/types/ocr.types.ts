/**
 * OCR Types
 */

export interface InvoiceJsonData {
  seller?: {
    name?: string;
    address?: string;
    phone?: string;
    fax?: string;
    tax_code?: string;
  };
  invoice?: {
    title?: string;
    serial?: string;
    number?: string;
    date?: string;
    cqt_code?: string;
  };
  buyer?: {
    name?: string;
    unit_name?: string;
    cccd?: string;
    passport?: string;
    tax_code?: string;
    address?: string;
    payment_method?: string;
  };
  items?: Array<{
    stt?: string;
    name?: string;
    unit?: string;
    quantity?: string;
    unit_price?: string;
    amount?: string;
  }>;
  totals?: {
    subtotal?: string;
    vat_rate?: string;
    vat_amount?: string;
    total?: string;
    total_in_words?: string;
  };
}

export interface OcrPage {
  page_number: number;
  llm_json: InvoiceJsonData | null;
  status: string;
}

export interface OcrUploadResponse {
  status: string;
  data?: {
    document?: {
      id: string;
    };
    total_pages?: number;
  };
  message?: string;
  error?: string;
}

export interface OcrResultResponse {
  status: string;
  data?: {
    pages?: OcrPage[];
    processing_status?: {
      completed: number;
      processing: number;
      pending: number;
      failed: number;
    };
  };
}


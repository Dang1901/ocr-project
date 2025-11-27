import React from 'react';
import { Button, Space, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { PDFViewerPanel } from '../OCR.styles';
import { colors } from '@config/colors';

const { Text } = Typography;

interface PDFViewerProps {
  pdfLoaded: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfLoaded, onFileUpload }) => {
  return (
    <PDFViewerPanel>
      {!pdfLoaded ? (
        <Space direction="vertical" align="center" size="large" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8F0F0 0%, #F0F8F8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(26, 54, 54, 0.15)',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
            }}
          >
            <FileTextOutlined 
              style={{ 
                fontSize: '56px', 
                color: colors.textPrimary,
                transition: 'all 0.3s ease',
              }} 
            />
          </div>
          <Text style={{ color: colors.textBlack, fontSize: '18px', fontWeight: 600, marginTop: '8px' }}>PDF Viewer</Text>
          <Text type="secondary" style={{ fontSize: '14px', marginBottom: '16px' }}>
            Upload a PDF file to start OCR processing
          </Text>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload">
            <Button
              type="default"
              size="large"
              style={{
                borderWidth: '2px',
                borderColor: colors.textPrimary,
                color: colors.textPrimary,
                backgroundColor: 'transparent',
                borderRadius: '8px',
                height: '44px',
                padding: '0 32px',
                fontSize: '15px',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => document.getElementById('pdf-upload')?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.textPrimary;
                e.currentTarget.style.color = colors.white;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 54, 54, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.textPrimary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Upload PDF
            </Button>
          </label>
        </Space>
      ) : (
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            animation: 'fadeIn 0.5s ease-in',
          }}
        >
          <Space direction="vertical" align="center" size="middle">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8F0F0 0%, #F0F8F8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite',
              boxShadow: '0 4px 16px rgba(26, 54, 54, 0.2)',
            }}>
              <FileTextOutlined style={{ fontSize: '40px', color: colors.textPrimary }} />
            </div>
            <Text style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px' }}>PDF Loaded</Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>Ready to convert</Text>
          </Space>
        </div>
      )}
    </PDFViewerPanel>
  );
};

export default PDFViewer;


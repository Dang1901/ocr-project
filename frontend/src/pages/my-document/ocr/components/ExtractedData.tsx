import React from 'react';
import { Typography } from 'antd';
import { ExtractedDataPanel } from '../OCR.styles';

const { Text } = Typography;

interface ExtractedDataProps {
  extractedData: string;
}

const ExtractedData: React.FC<ExtractedDataProps> = ({ extractedData }) => {
  return (
    <ExtractedDataPanel>
      <div style={{ marginBottom: '20px' }}>
        <Text style={{ color: '#000000', fontSize: '18px', fontWeight: '600', letterSpacing: '0.3px' }}>
          Extracted Data
        </Text>
      </div>
      {extractedData ? (
        <div
          style={{
            flex: 1,
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '2px solid #f0f0f0',
            borderRadius: '8px',
            maxHeight: 'calc(100% - 100px)',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            color: '#1a1a1a',
            fontSize: '14px',
            lineHeight: '1.8',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
          }}
        >
          {extractedData}
        </div>
      ) : (
        <div 
          style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Text style={{ fontSize: '24px' }}>📄</Text>
          </div>
          <Text style={{ color: '#999999', fontSize: '15px', fontWeight: 500 }}>
            Extracted text will appear here
          </Text>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Click Convert to process the PDF
          </Text>
        </div>
      )}
    </ExtractedDataPanel>
  );
};

export default ExtractedData;


import React from 'react';
import { Button, Slider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { OCRFooter } from '../OCR.styles';
import { colors } from '@config/colors';

interface OCRFooterProps {
  extractProgress: number;
  extractedData: string;
  onApprove: () => void;
}

const OCRFooterComponent: React.FC<OCRFooterProps> = ({ 
  extractProgress, 
  extractedData, 
  onApprove 
}) => {
  return (
    <OCRFooter>
      <Slider
        value={extractProgress}
        disabled
        style={{ flex: 1, maxWidth: 'calc(100% - 120px)' }}
        trackStyle={{ 
          backgroundColor: extractProgress > 0 ? colors.textPrimary : '#e2e8f0',
          background: extractProgress > 0 
            ? `linear-gradient(90deg, ${colors.textPrimary} 0%, ${colors.primaryLight} 100%)` 
            : '#e2e8f0',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '4px',
        }}
        railStyle={{
          backgroundColor: '#e2e8f0',
          height: '4px',
        }}
        handleStyle={{ 
          display: 'none', // Hide the handle
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={onApprove}
        disabled={!extractedData}
        style={{
          background: extractedData ? colors.textPrimary : colors.disabled,
          borderColor: extractedData ? colors.textPrimary : colors.disabled,
          color: colors.white,
          minWidth: '120px',
          height: '40px',
          fontWeight: 600,
          boxShadow: extractedData ? '0 2px 8px rgba(26, 54, 54, 0.3)' : 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (extractedData) {
            e.currentTarget.style.background = colors.primaryLight;
            e.currentTarget.style.borderColor = colors.primaryLight;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 54, 54, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (extractedData) {
            e.currentTarget.style.background = colors.textPrimary;
            e.currentTarget.style.borderColor = colors.textPrimary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(232, 90, 90, 0.3)';
          }
        }}
      >
        Approve
      </Button>
    </OCRFooter>
  );
};

export default OCRFooterComponent;


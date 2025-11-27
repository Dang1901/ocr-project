import styled, { keyframes } from 'styled-components';
import { Button } from 'antd';
import { colors } from '@config/colors';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const OCRContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #f5f7fa;
  padding: 24px;
  box-sizing: border-box;
  overflow: auto;
  gap: 20px;
`;

export const OCRContent = styled.div`
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
  align-items: center;
  margin-bottom: 24px;
`;

export const PDFViewerPanel = styled.div`
  flex: 1;
  height: 100%;
  min-height: 500px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(26, 54, 54, 0.05) inset;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${colors.textPrimary}, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 0 0 2px rgba(26, 54, 54, 0.15) inset;
    border-color: ${colors.textPrimary};
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }
`;

export const ConvertButton = styled(Button)`
  height: 50px;
  min-width: 100px;
  border: 2px solid ${colors.textPrimary};
  border-radius: 8px;
  background: linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.primaryLight} 100%);
  color: ${colors.white};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(26, 54, 54, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%);
    border-color: ${colors.primaryLight};
    color: ${colors.white};
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 16px rgba(26, 54, 54, 0.6);

    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #d9d9d9;
    border-color: ${colors.disabled};
    color: ${colors.white};
    box-shadow: none;
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1);
    box-shadow: 0 3px 8px rgba(26, 54, 54, 0.5);
  }
`;

export const ExtractedDataPanel = styled.div`
  flex: 1;
  height: 100%;
  min-height: 500px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
  padding: 32px;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(26, 54, 54, 0.05) inset;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideIn} 0.5s ease-out;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${colors.textPrimary}, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.12),
      0 0 0 2px rgba(26, 54, 54, 0.15) inset;
    border-color: ${colors.textPrimary};
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }
`;

export const OCRFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: ${colors.tableBorder};
  }
`;


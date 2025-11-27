import React from 'react';
import { Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const BannerContainer = styled.div`
  margin-bottom: 16px;
  
  .ant-alert {
    border-radius: 4px;
    border: none;
    background-color: #fffbe6;
    border-left: 4px solid #faad14;
  }
  
  .ant-alert-message {
    color: #ad6800;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .ant-alert-icon {
    color: #faad14;
  }
`;

interface PermissionWarningBannerProps {
  message?: string;
}

const PermissionWarningBanner: React.FC<PermissionWarningBannerProps> = ({
  message = "You do not have sufficient permissions to view this page!",
}) => {
  return (
    <BannerContainer>
      <Alert
        message={message}
        type="warning"
        icon={<ExclamationCircleOutlined />}
        showIcon
        closable={false}
      />
    </BannerContainer>
  );
};

export default PermissionWarningBanner;


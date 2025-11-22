import React from 'react';
import { Badge } from 'antd';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const PulsingBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 12px;
    height: 12px;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

interface StatusBadgeProps {
  status: string;
}

const getStatusBadge = (status: string): "success" | "error" | "processing" | "warning" | "default" => {
  const statusUpper = (status || '').toUpperCase();
  if (statusUpper === 'ACTIVE') {
    return 'success';
  } else if (statusUpper === 'INACTIVE') {
    return 'error';
  }
  return 'processing';
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeStatus = getStatusBadge(status);
  
  return (
    <PulsingBadge status={badgeStatus} />
  );
};

export default StatusBadge;


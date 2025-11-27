import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const StatusDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  animation: ${pulse} 1.5s ease-in-out infinite;
  display: inline-block;
`;

interface StatusBadgeProps {
  status: string;
}

const getStatusColor = (status: string): string => {
  const statusUpper = (status || '').toUpperCase();
  if (statusUpper === 'ACTIVE') {
    return '#52c41a'; // success green
  } else if (statusUpper === 'INACTIVE') {
    return '#ff4d4f'; // error red
  }
  return '#1890ff'; // processing blue
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status);
  
  return (
    <StatusDot $color={color} />
  );
};

export default StatusBadge;


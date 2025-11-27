import React from 'react';
import { Card, Typography, Button } from 'antd';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { colors } from '@config/colors';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  text-align: center;
  max-width: 600px;
  margin: 40px auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .ant-card-body {
    padding: 48px 32px;
  }
`;

const IconWrapper = styled.div`
  font-size: 64px;
  color: #ff4d4f;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TitleWrapper = styled(Title)`
  margin-bottom: 16px !important;
  color: ${colors.textPrimary} !important;
`;

const DescriptionWrapper = styled(Text)`
  font-size: 16px;
  color: #8c8c8c;
  display: block;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

interface NoPermissionCardProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  customAction?: React.ReactNode;
}

const NoPermissionCard: React.FC<NoPermissionCardProps> = ({
  title = "Không có quyền truy cập",
  description = "Bạn không có quyền để xem hoặc thực hiện hành động này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.",
  showBackButton = true,
  backButtonText = "Về trang chủ",
  backButtonPath = "/",
  customAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <StyledCard>
      <IconWrapper>
        <LockOutlined />
      </IconWrapper>
      
      <TitleWrapper level={3}>
        {title}
      </TitleWrapper>
      
      <DescriptionWrapper>
        {description}
      </DescriptionWrapper>

      {(showBackButton || customAction) && (
        <ButtonWrapper>
          {showBackButton && (
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleBack}
              style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
            >
              {backButtonText}
            </Button>
          )}
          {customAction}
        </ButtonWrapper>
      )}
    </StyledCard>
  );
};

export default NoPermissionCard;


import styled from "styled-components";

export const DocumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  padding: 12px;
  box-sizing: border-box;
  gap: 12px;
`;

export const TabContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #fff;
  height: 48px;
  border-radius: 8px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const TabPane = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 24px;
  box-sizing: border-box;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  height: 100%;
  color: ${props => props.$active ? '#1A3636' : '#808080'};
  border-bottom: ${props => props.$active ? '2px solid #1A3636' : 'none'};
  transition: all 0.2s;
  position: relative;

  &:hover {
    background-color: ${props => props.$active ? 'transparent' : '#f5f5f5'};
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-height: 400px;
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const InfoCard = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
`;

export const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
`;

export const InfoValue = styled.div`
  font-size: 14px;
  color: #000;
  font-weight: 600;
`;


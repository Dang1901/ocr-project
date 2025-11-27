import styled from "styled-components";
import { colors } from "@config/colors";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  background-color: ${colors.primary};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 100;
  position: relative;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  padding: 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textPrimary};
  position: relative;

  svg {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      color: ${colors.white};
    }
  }
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 600px;
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 12px 0 36px;
  background-color: ${colors.backgroundDark};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  color: ${colors.white};
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${colors.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${colors.accent};
    background-color: ${colors.primaryLight};
  }

  &:hover {
    border-color: ${colors.border};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${colors.textSecondary};
  pointer-events: none;
`;

const KeyboardShortcutBadge = styled.span`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 500;
  color: ${colors.textSecondary};
  background: ${colors.hoverLight};
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
`;

const UtilityIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: ${colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.hover};
    color: ${colors.white};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const RegionDropdown = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 32px;
  background: transparent;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  color: ${colors.text};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.hoverLight};
    border-color: ${colors.border};
  }
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 32px;
  background: transparent;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  color: ${colors.text};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.hoverLight};
    border-color: ${colors.border};
  }
`;

const LogoHeader = styled.div`
  width: 240px;
  box-sizing: border-box;
  height: 48px;
  background-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  color: ${colors.white};
`;

const GlobalSearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  outline: none;
  color: ${colors.white};
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  height: 32px;
  position: relative;
  overflow: hidden;
  background: transparent;
  & > * {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0s;
  }

  &:focus {
    outline: none;
    border: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }

  &:hover {
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    
    &::before {
      transform: translateX(100%);
      transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
    }
  }

  span {
    font-size: 13px;
    font-weight: 500;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const KeyboardShortcut = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;

  span:first-child {
    opacity: 0.9;
  }

  span:last-child {
    font-weight: 500;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  justify-content: end;
  gap: 12px;
  border-left: 1px solid ${colors.borderDark};
`;

const UserGroup = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  gap: 19px;
`;

const UserAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  background: ${colors.primary};
  border: 1px solid ${colors.border};
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  min-width: 320px;
  z-index: 1000;
  overflow: hidden;
  color: ${colors.text};
`;

const DropdownTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${colors.backgroundDark};
  border-bottom: 1px solid ${colors.border};
  font-size: 12px;
`;

const DropdownTopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.textSecondary};
`;

const DropdownTopBarRight = styled.div`
  color: ${colors.accent};
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: ${colors.accentHover};
  }
`;

const DropdownSection = styled.div`
  padding: 16px;
`;

const DropdownSectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textSecondary};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AccountInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AccountInfoLabel = styled.div`
  font-size: 13px;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AccountInfoValue = styled.div`
  font-size: 13px;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.hover};
    color: ${colors.text};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: 8px 0;
`;

const DropdownLink = styled.a`
  display: block;
  padding: 8px 16px;
  color: ${colors.text};
  text-decoration: none;
  font-size: 13px;
  transition: background-color 0.2s;
  cursor: pointer;
  
  &:hover {
    background: ${colors.hoverLight};
    color: ${colors.white};
  }
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  
  &:first-of-type {
    margin-top: 0;
  }
`;

const MultiSessionButton = styled(DropdownButton)`
  background: ${colors.accent};
  color: ${colors.white};
  
  &:hover {
    background: ${colors.accentHover};
  }
`;

const SignOutButton = styled(DropdownButton)`
  background: ${colors.error};
  color: ${colors.white};
  
  &:hover {
    background: #ff8555;
  }
`;

export { 
  HeaderContainer, 
  HeaderContent, 
  LogoHeader, 
  GlobalSearchButton, 
  KeyboardShortcut, 
  UserInfo, 
  UserGroup, 
  UserAvatar,
  SearchBar,
  SearchInput,
  SearchIcon,
  KeyboardShortcutBadge,
  UtilityIcons,
  IconButton,
  RegionDropdown,
  AccountInfo,
  UserDropdown,
  DropdownTopBar,
  DropdownTopBarLeft,
  DropdownTopBarRight,
  DropdownSection,
  DropdownSectionTitle,
  AccountInfoRow,
  AccountInfoLabel,
  AccountInfoValue,
  CopyButton,
  Divider,
  DropdownLink,
  MultiSessionButton,
  SignOutButton
};


import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  IconDashboard,
  IconTrendingUp,
  IconSettings,
  IconUser,
  IconUserCog,
  IconBuildingCommunity,
  IconPuzzle,
  IconKey,
  IconScan,
  IconHistory,
  IconFileText,
  IconShieldLock,
} from "@tabler/icons-react";
import { colors } from "@config/colors";

// Styled Components
const SidebarContainer = styled.aside<{ $collapsed: boolean }>`
  width: ${(props) => (props.$collapsed ? "64px" : "240px")};
  background: ${colors.white};
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 13px;
  height: calc(100vh - 48px);
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
  padding-top: 0;
`;

const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? "center" : "space-between")};
  padding: 16px;
  border-bottom: 1px solid ${colors.border};
  background: ${colors.white};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const SidebarTitle = styled.h2<{ $collapsed: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
  display: ${(props) => (props.$collapsed ? "none" : "block")};
`;

const SidebarToggle = styled.button<{ $collapsed: boolean }>`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background-color: #f1f5f9;
    color: ${colors.textPrimary};
  }

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
    transform: ${(props) => (props.$collapsed ? "rotate(180deg)" : "rotate(0deg)")};
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.25rem;
`;

const NavLink = styled(Link)<{
  $hasChildren?: boolean;
  $level: number;
  $notReady?: boolean;
  $collapsed?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem ${(props) => (props.$collapsed ? "0.75rem" : "1.5rem")};
  padding-left: ${(props) => (props.$collapsed ? "0.75rem" : 1.5 + props.$level * 1 + "rem")};
  color: ${(props) => (props.$notReady ? colors.textSecondary : colors.textPrimary)};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  justify-content: ${(props) => (props.$collapsed ? "center" : props.$hasChildren ? "space-between" : "flex-start")};
  opacity: ${(props) => (props.$notReady ? 0.6 : 1)};
  cursor: ${(props) => (props.$notReady ? "not-allowed" : "pointer")};
  position: relative;

  &:hover {
    background: ${(props) => (props.$notReady ? "transparent" : colors.backgroundLight)};
    color: ${(props) => (props.$notReady ? colors.textSecondary : colors.textPrimary)};
  }

  &.active {
    background: ${(props) => (props.$notReady ? "transparent" : colors.backgroundLight)};
    color: ${colors.textPrimary};
    font-weight: 600;
  }

  /* Tooltip when collapsed */
  ${(props) => props.$collapsed && !props.$notReady && `
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
      padding: 6px 12px;
      background: ${colors.textPrimary};
      color: ${colors.white};
      font-size: 12px;
      white-space: nowrap;
      border-radius: 4px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
    }
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const NavButton = styled.button<{
  $hasChildren?: boolean;
  $level: number;
  $notReady?: boolean;
  $collapsed?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem ${(props) => (props.$collapsed ? "0.75rem" : "1.5rem")};
  padding-left: ${(props) => (props.$collapsed ? "0.75rem" : 1.5 + props.$level * 1 + "rem")};
  color: ${(props) => (props.$notReady ? colors.textSecondary : colors.textPrimary)};
  background: none;
  font-weight: 500;
  transition: all 0.2s ease;
  justify-content: ${(props) => (props.$collapsed ? "center" : props.$hasChildren ? "space-between" : "flex-start")};
  width: 100%;
  cursor: ${(props) => (props.$notReady ? "not-allowed" : "pointer")};
  font-size: inherit;
  border: none;
  outline: none;
  opacity: ${(props) => (props.$notReady ? 0.6 : 1)};
  position: relative;

  &:hover {
    border: none;
    outline: none;
    color: ${(props) => (props.$notReady ? colors.textSecondary : colors.textPrimary)};
    background: ${(props) => (props.$notReady ? "transparent" : colors.backgroundLight)};
  }

  &:focus,
  &:focus-visible {
    border: none;
    outline: none;
    box-shadow: none;
  }

  &.active {
    border: none;
    outline: none;
    color: ${colors.textPrimary};
    background: ${(props) => (props.$notReady ? "transparent" : colors.backgroundLight)};
    font-weight: 600;
  }

  &:disabled {
    cursor: not-allowed;
  }

  /* Tooltip when collapsed */
  ${(props) => props.$collapsed && !props.$notReady && `
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
      padding: 6px 12px;
      background: ${colors.textPrimary};
      color: ${colors.white};
      font-size: 12px;
      white-space: nowrap;
      border-radius: 4px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
    }
    &:hover::after {
      opacity: 1;
    }
  `}
`;

const MenuContent = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$collapsed ? "0" : "0.75rem")};
  flex: 1;
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
  
  /* Hide text when collapsed */
  & > *:not(:first-child) {
    display: ${(props) => (props.$collapsed ? "none" : "block")};
  }
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean; $collapsed?: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${(props) => (props.$isExpanded ? "90deg" : "0deg")});
  display: ${(props) => (props.$collapsed ? "none" : "flex")};
  align-items: center;
`;

const SubNavList = styled.ul<{ $isExpanded: boolean; $level: number; $collapsed?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${(props) => (props.$isExpanded && !props.$collapsed ? "block" : "none")};
`;

const ComingSoonBadge = styled.span<{ $collapsed?: boolean }>`
  display: ${(props) => (props.$collapsed ? "none" : "flex")};
  align-items: center;
  color: rgb(247, 124, 1);
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-left: auto;
`;


interface MenuItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  children?: MenuItem[];
  notReady?: boolean;
}

const staticMenuItems: MenuItem[] = [
  {
    id: "overview",
    path: "/overview",
    icon: IconDashboard,
    label: "Overview",
    notReady: false,
    children: [
      {
        id: "dashboard",
        path: "/dashboard",
        icon: IconTrendingUp,
        label: "Dashboard",
        notReady: false,
      },
    ],
  },
  {
    id: "iam",
    path: "/iam",
    icon: IconSettings,
    label: "IAM",
    notReady: false,
    children: [
      {
        id: "users",
        path: "/users",
        icon: IconUser,
        label: "Users",
        notReady: false,
      },
      {
        id: "roles",
        path: "/roles",
        icon: IconUserCog,
        label: "Roles",
        notReady: false,
      },
      {
        id: "departments",
        path: "/departments",
        icon: IconBuildingCommunity,
        label: "Departments",
        notReady: false,
      },
    ],
  },
  {
    id: "my-document",
    path: "/my-document",
    icon: IconFileText,
    label: "My Document",
    notReady: false,
    children: [
      {
        id: "documents",
        path: "/documents",
        icon: IconFileText,
        label: "Documents",
        notReady: false,
      },
      {
        id: "ocr",
        path: "/ocr",
        icon: IconScan,
        label: "Optical Character Recognition",
        notReady: false,
      },
    ],
  },
  {
    id: "activity-log",
    path: "/activity-log",
    icon: IconHistory,
    label: "Activity Log",
    notReady: false,
  },
];

export type { MenuItem };
export {
  staticMenuItems,
  SidebarContainer,
  SidebarSection,
  SidebarHeader,
  SidebarTitle,
  SidebarToggle,
  NavList,
  NavItem,
  NavLink,
  NavButton,
  MenuContent,
  ExpandIcon,
  SubNavList,
  ComingSoonBadge,
};


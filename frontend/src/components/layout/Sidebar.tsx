import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    IconChevronRight,
    IconAlertCircle,
    IconChevronLeft
} from '@tabler/icons-react';
import { SidebarContainer, SidebarSection, SidebarHeader, SidebarTitle, SidebarToggle, NavList, NavItem, NavLink, NavButton, MenuContent, ExpandIcon, SubNavList, ComingSoonBadge, staticMenuItems } from './Sidebar.styles';
import type { MenuItem } from './Sidebar.styles';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

    const isActive = (path: string): boolean => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const isItemActive = (item: MenuItem): boolean => {
        if (isActive(item.path)) return true;
        if (item.children) {
            return item.children.some(child => isItemActive(child));
        }
        return false;
    };

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleMenuClick = (item: MenuItem) => {
        if (item.children && item.children.length > 0) {
            toggleExpanded(item.id);
        }
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const IconComponent = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const itemActive = isItemActive(item);
        const isNotReady = item.notReady;

        return (
            <React.Fragment key={item.id}>
                <NavItem>
                    {hasChildren ? (
                        <NavButton
                            $hasChildren={hasChildren}
                            $level={level}
                            $notReady={isNotReady}
                            $collapsed={isCollapsed}
                            className={itemActive ? 'active' : ''}
                            onClick={() => handleMenuClick(item)}
                            disabled={isNotReady}
                            data-tooltip={isCollapsed ? item.label : ''}
                        >
                            <MenuContent $collapsed={isCollapsed}>
                                <IconComponent size={18} />
                                {!isCollapsed && item.label}
                                {!isCollapsed && isNotReady && <ComingSoonBadge><IconAlertCircle size={12} /></ComingSoonBadge>}
                            </MenuContent>
                            <ExpandIcon $isExpanded={isExpanded} $collapsed={isCollapsed}>
                                <IconChevronRight size={12} />
                            </ExpandIcon>
                        </NavButton>
                    ) : (
                        <NavLink
                            to={isNotReady ? '#' : item.path}
                            $hasChildren={hasChildren}
                            $level={level}
                            $notReady={isNotReady}
                            $collapsed={isCollapsed}
                            className={isActive(item.path) ? 'active' : ''}
                            data-tooltip={isCollapsed ? item.label : ''}
                            onClick={(e) => {
                                if (isNotReady) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <MenuContent $collapsed={isCollapsed}>
                                <IconComponent size={18} />
                                {!isCollapsed && item.label}
                                {!isCollapsed && isNotReady && <ComingSoonBadge><IconAlertCircle size={12} /></ComingSoonBadge>}
                            </MenuContent>
                        </NavLink>
                    )}
                </NavItem>

                {hasChildren && (
                    <SubNavList
                        $isExpanded={isExpanded}
                        $level={level}
                        $collapsed={isCollapsed}
                    >
                        {item.children?.map((subItem) => renderMenuItem(subItem, level + 1))}
                    </SubNavList>
                )}
            </React.Fragment>
        );
    };

    return (
        <SidebarContainer $collapsed={isCollapsed}>
            <SidebarHeader $collapsed={isCollapsed}>
                <SidebarTitle $collapsed={isCollapsed}>Console Home</SidebarTitle>
                {onToggle && (
                    <SidebarToggle $collapsed={isCollapsed} onClick={onToggle}>
                        <IconChevronLeft size={14} />
                    </SidebarToggle>
                )}
            </SidebarHeader>
            <SidebarSection>
                <NavList>
                    {staticMenuItems.map((item) => renderMenuItem(item))}
                </NavList>
            </SidebarSection>
        </SidebarContainer>
    );
};

export default Sidebar;

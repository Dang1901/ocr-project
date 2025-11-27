import React, { useState, useRef, useEffect } from 'react';
import { 
  HeaderContainer, 
  HeaderContent, 
  LogoHeader, 
  UserAvatar, 
  UserGroup, 
  UserInfo,
  UtilityIcons,
  IconButton,
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
  SignOutButton
} from './Header.styles';
import Logo from '../common/icon/Logo';
import { 
  IconBell, 
  IconHelp, 
  IconSettings,
  IconGridDots,
  IconCopy,
  IconChevronUp
} from '@tabler/icons-react';
import { logout } from '../../api/auth.api';
import { useCurrentUserInfo } from '../../hooks/queries/currentUser/useCurrentUserInfo';
import { colors } from '@config/colors';

interface HeaderProps {
    onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { userInfo, isLoading } = useCurrentUserInfo();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleCopyAccountId = async () => {
        if (userInfo?.account_id) {
            try {
                await navigator.clipboard.writeText(userInfo.account_id);
                // You can add a toast notification here if needed
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const handleSignOut = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            window.location.href = '/login';
        }
    };

    return (
        <HeaderContainer>
            <LogoHeader>
                <Logo />
                <span style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.2, color: colors.white }}>OCR - TC</span>
            </LogoHeader>
            <HeaderContent>
                <UtilityIcons>
                    <IconButton title="Services">
                        <IconGridDots size={18} />
                    </IconButton>
                    <IconButton title="Notifications">
                        <IconBell size={18} />
                    </IconButton>
                    <IconButton title="Help">
                        <IconHelp size={18} />
                    </IconButton>
                    <IconButton title="Settings">
                        <IconSettings size={18} />
                    </IconButton>
                </UtilityIcons>
                <AccountInfo>
                    <span>Account ID: {isLoading ? '...' : (userInfo?.account_id || 'N/A')}</span>
                </AccountInfo>
            </HeaderContent>
            <UserInfo>
                <UserGroup>
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onClick={() => setMenuOpen(!menuOpen)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <UserAvatar
                                src="https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
                                alt="User avatar"
                            />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#d1d5db' }}>
                                {isLoading ? '...' : (userInfo?.username || 'User')}
                            </span>
                        </div>
                        {menuOpen && (
                            <UserDropdown>
                                <DropdownTopBar>
                                    <DropdownTopBarLeft>
                                        <span>Account ID: {isLoading ? '...' : (userInfo?.account_id || 'N/A')}</span>
                                        <IconChevronUp size={14} />
                                    </DropdownTopBarLeft>
                                    <DropdownTopBarRight>
                                        {isLoading ? '...' : (userInfo?.username || 'User')}
                                    </DropdownTopBarRight>
                                </DropdownTopBar>
                                
                                <DropdownSection>
                                    <DropdownSectionTitle>Account Information</DropdownSectionTitle>
                                    <AccountInfoRow>
                                        <AccountInfoLabel>Account ID</AccountInfoLabel>
                                        <AccountInfoValue>
                                            <span>{isLoading ? '...' : (userInfo?.account_id || 'N/A')}</span>
                                            <CopyButton onClick={handleCopyAccountId} title="Copy Account ID">
                                                <IconCopy size={14} />
                                            </CopyButton>
                                        </AccountInfoValue>
                                    </AccountInfoRow>
                                </DropdownSection>
                                
                                <Divider />
                                
                                <DropdownSection style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                                    <SignOutButton onClick={handleSignOut}>
                                        Sign out
                                    </SignOutButton>
                                </DropdownSection>
                            </UserDropdown>
                        )}
                    </div>
                </UserGroup>
            </UserInfo>
        </HeaderContainer>
    );
};

export default Header;

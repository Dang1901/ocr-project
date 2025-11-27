import React, { useEffect, useState } from "react";
import { AppContainer } from "./AppContainer.styles";
import Header from "./Header";
import MainBody from "./MainBody";

const AppLayout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            // Handle click outside if needed
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <AppContainer>
            <Header onToggleSidebar={toggleSidebar} />
            <MainBody isCollapsed={isCollapsed} onToggleSidebar={toggleSidebar} />
        </AppContainer>
    );
};

export default AppLayout;


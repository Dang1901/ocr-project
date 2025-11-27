import React from "react";
import { BodyContainer, ContentContainer } from "./MainBody.styles";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

interface MainBodyProps {
    isCollapsed: boolean;
    onToggleSidebar?: () => void;
}

const MainBody: React.FC<MainBodyProps> = ({ isCollapsed, onToggleSidebar }) => {
    return (
        <BodyContainer>
            <Sidebar isCollapsed={isCollapsed} onToggle={onToggleSidebar} />
            <ContentContainer>
                <Outlet />
            </ContentContainer>
        </BodyContainer>
    );
};

export default MainBody;


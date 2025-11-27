import React from "react";
import { Tag } from "antd";
import type { RoleType } from "@/types/types";

interface RoleTagsProps {
  roles: RoleType[];
  maxDisplay?: number;
  showAll?: boolean;
}

const RoleTags: React.FC<RoleTagsProps> = ({ 
  roles, 
  maxDisplay = 3, 
  showAll = false 
}) => {
  if (!roles || roles.length === 0) {
    return <span style={{ color: "#999", fontSize: "13px" }}>--</span>;
  }

  // Color mapping based on role code
  const getRoleColor = (roleCode: string) => {
    switch (roleCode.toUpperCase()) {
      case "ADMIN":
        return "red";
      case "PROJECT_MANAGER":
        return "volcano";
      case "TEST_ENGINEER":
        return "orange";
      case "VIEWER":
        return "default";
      default:
        return "default";
    }
  };

  const displayRoles = showAll ? roles : roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {displayRoles.map((role: RoleType, index: number) => (
        <Tag 
          key={`${role.id}-${index}`}
          color={getRoleColor(role.code)}
          style={{ margin: 0 }}
        >
          {role.name || role.level || role.code}
        </Tag>
      ))}
      
      {!showAll && remainingCount > 0 && (
        <Tag color="default" style={{ margin: 0 }}>
          +{remainingCount} more
        </Tag>
      )}
    </div>
  );
};

export default RoleTags;


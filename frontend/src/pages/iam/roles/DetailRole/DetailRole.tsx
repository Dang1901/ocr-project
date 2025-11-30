import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Tag, Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useGetRoleById } from "@/hooks/queries/role/useGetRoleById";
import HeaderInformation from "@/components/common/HeaderInformation";
import { MainContainer } from "@/components/layout/MainContainer.styles";
import UsersByRole from "./components/UsersByRole/UsersByRole";
import RolePermissions from "./components/RolePermissions/RolePermissions";
import RoleDocumentPermissions from "./components/RoleDocumentPermissions/RoleDocumentPermissions";

const DetailRole: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const [activeTab, setActiveTab] = useState("permissions");

  // Fetch role details
  const { data: role, isLoading: roleLoading, error: roleError } = useGetRoleById(roleId || "");

  if (roleLoading) {
    return (
      <MainContainer>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <Spin size="large" />
        </div>
      </MainContainer>
    );
  }

  if (roleError || !role) {
    return (
      <MainContainer>
        <div style={{ padding: 32, textAlign: "center" }}>
          <p>Failed to load role details</p>
          <Button onClick={() => window.history.back()} style={{ marginTop: 16 }}>
            Back to Roles
          </Button>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <HeaderInformation
        breadcrumbs={[
          { label: "Roles", to: "/roles" },
          { label: role.name || role.code },
        ]}
        title={role.name || role.code}
        icon={<FileTextOutlined />}
        description={
          <div style={{ display: "flex", gap: 20, marginTop: 15, flexWrap: "wrap" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Status: </div>
              <Tag color={role.is_active ? "green" : "red"}>
                {role.is_active ? "Active" : "Inactive"}
              </Tag>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Code: </div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {role.code}
              </div>
            </div>
            {role.created_at && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>Created At: </div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>
                  {role.created_at ? new Date(role.created_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
            )}
          </div>
        }
        tabs={[
          { key: "permissions", label: "Permissions" },
          { key: "document", label: "Document" },
          { key: "users", label: "Users" },
        ]}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "permissions" && role?.code && roleId && (
        <RolePermissions roleCode={role.code} roleId={roleId} />
      )}

      {activeTab === "document" && role?.code && (
        <RoleDocumentPermissions roleCode={role.code} />
      )}

      {activeTab === "users" && roleId && (
        <UsersByRole roleId={roleId} />
      )}
    </MainContainer>
  );
};

export default DetailRole;


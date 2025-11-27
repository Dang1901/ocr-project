import { Card, Row, Col, Breadcrumb, Typography, Tabs } from 'antd';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '@config/colors';

const { Title, Text } = Typography;

type BreadcrumbItem = { label: string; to?: string };
type TabItem = { key: string; label: string; to?: string };

type HeaderInformationProps = {
  breadcrumb?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  tabs?: TabItem[];
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
};

export default function HeaderInformation({
  breadcrumb,
  breadcrumbs,
  title,
  description,
  action,
  icon,
  tabs,
  activeTabKey,
  onTabChange,
}: HeaderInformationProps) {
  const navigate = useNavigate();

  const items = (tabs ?? []).map(t => ({ key: t.key, label: t.label }));

  return (
    <Card style={{ borderRadius: 0 }}>
      <Row align="middle" justify="space-between" gutter={[16, 16]}>
        <Col flex="auto" style={{ minWidth: 0 }}>
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumb
              separator="›"
              items={breadcrumbs.map(bc => ({
                title: bc.to ? (
                  <Link to={bc.to} style={{ color: 'rgba(0,0,0,0.45)' }}>
                    {bc.label}
                  </Link>
                ) : (
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                    {bc.label}
                  </span>
                ),
              }))}
              style={{ marginBottom: 8 }}
            />
          ) : (
            breadcrumb && (
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: colors.textPrimary }}>
                  {breadcrumb}
                </Text>
              </div>
            )
          )}

          {/* Title + Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {icon}
            <Title level={4} style={{ margin: 0, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {title}
            </Title>
          </div>

          {/* Description */}
          {description && (
            <Text type="secondary" style={{ display: 'block', marginTop: 6 }}>
              {description}
            </Text>
          )}
        </Col>

        {/* Actions (right side) */}
        {action && (
          <Col flex="none">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {action}
            </div>
          </Col>
        )}
      </Row>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div style={{ marginTop: 12, marginBottom: -25 }}>
          <Tabs
            activeKey={activeTabKey}
            items={items}
            onChange={(key) => {
              if (onTabChange) {
                onTabChange(key);
              } else {
                const tab = tabs.find(t => t.key === key);
                if (tab?.to) navigate(tab.to);
              }
            }}
          />
        </div>
      )}
    </Card>
  );
}


import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button, Table, Tag, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ScanOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  HistoryOutlined,
  ExportOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors } from '@config/colors';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const ocrStats = {
    totalProcessed: 1247,
    successful: 1189,
    pending: 24,
    failed: 34,
    accuracy: 95.3,
    avgProcessingTime: 1.8,
  };

  const recentActivities = [
    {
      id: 1,
      fileName: 'document_001.pdf',
      status: 'completed',
      extractedText: '245 characters',
      processedAt: '2 hours ago',
      accuracy: 96.5,
    },
    {
      id: 2,
      fileName: 'invoice_scan.jpg',
      status: 'completed',
      extractedText: '1,234 characters',
      processedAt: '5 hours ago',
      accuracy: 94.2,
    },
    {
      id: 3,
      fileName: 'receipt.png',
      status: 'processing',
      extractedText: 'Processing...',
      processedAt: 'Just now',
      accuracy: 0,
    },
    {
      id: 4,
      fileName: 'form_document.jpg',
      status: 'completed',
      extractedText: '892 characters',
      processedAt: 'Yesterday',
      accuracy: 97.1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#1A3636';
      case 'processing':
        return '#000000';
      case 'failed':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const activityColumns: ColumnsType<typeof recentActivities[0]> = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 200,
      render: (text: string) => (
        <Space>
          <ScanOutlined style={{ color: colors.textPrimary }} />
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Extracted Text',
      dataIndex: 'extractedText',
      key: 'extractedText',
      width: 150,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
      ),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 150,
      render: (accuracy: number, record) => {
        if (record.status === 'completed' && accuracy > 0) {
          return (
            <div>
              <Text type="secondary" style={{ fontSize: '12px', marginRight: '8px' }}>
                {accuracy}%
              </Text>
              <Progress
                percent={accuracy}
                size="small"
                strokeColor={colors.textPrimary}
                showInfo={false}
                style={{ width: '80px', display: 'inline-block' }}
              />
            </div>
          );
        }
        return <Text type="secondary" style={{ fontSize: '12px' }}>--</Text>;
      },
    },
    {
      title: 'Processed At',
      dataIndex: 'processedAt',
      key: 'processedAt',
      width: 120,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
      ),
    },
  ];

  const performanceColumns: ColumnsType<any> = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      width: '60%',
      render: (text: string) => <Text style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '40%',
      align: 'right' as const,
      render: (value: any, record: any) => {
        if (record.progress !== undefined) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <Progress
                percent={record.progress}
                size="small"
                strokeColor={colors.textPrimary}
                showInfo={false}
                style={{ width: '100px' }}
              />
              <Text strong style={{ fontSize: '13px', color: colors.textPrimary, minWidth: '40px' }}>
                {value}
              </Text>
            </div>
          );
        }
        return (
          <Text strong style={{ fontSize: '13px', color: record.color || colors.textPrimary }}>
            {value}
          </Text>
        );
      },
    },
  ];

  const performanceData = [
    {
      key: '1',
      metric: 'Average Processing Time',
      value: `${ocrStats.avgProcessingTime}s`,
      progress: 75,
      color: colors.textPrimary,
    },
    {
      key: '2',
      metric: 'Images Processed Today',
      value: '87',
      color: colors.textBlack,
    },
    {
      key: '3',
      metric: 'Success Rate',
      value: `${((ocrStats.successful / ocrStats.totalProcessed) * 100).toFixed(1)}%`,
      color: colors.textPrimary,
    },
    {
      key: '4',
      metric: 'Failed Processing',
      value: `${ocrStats.failed}`,
      color: colors.textBlack,
    },
  ];

  const systemStatusColumns: ColumnsType<any> = [
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      width: '60%',
      render: (text: string) => <Text style={{ fontSize: '13px' }}>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '40%',
      align: 'right' as const,
      render: (status: any, record: any) => {
        if (record.progress !== undefined) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <Progress
                percent={record.progress}
                size="small"
                strokeColor={colors.textPrimary}
                showInfo={false}
                style={{ width: '100px' }}
              />
              <Text strong style={{ fontSize: '13px', color: colors.textPrimary, minWidth: '60px' }}>
                {status}
              </Text>
            </div>
          );
        }
        if (typeof status === 'string' && status.includes('Online')) {
          return <Tag color={colors.textPrimary}>{status}</Tag>;
        }
        return (
          <Text strong style={{ fontSize: '13px', color: colors.textBlack }}>
            {status}
          </Text>
        );
      },
    },
  ];

  const systemStatusData = [
    {
      key: '1',
      service: 'OCR Service',
      status: 'Online',
    },
    {
      key: '2',
      service: 'Processing Queue',
      status: `${ocrStats.pending} items`,
    },
    {
      key: '3',
      service: 'Storage Usage',
      status: '2.4 GB / 10 GB',
      progress: 24,
    },
    {
      key: '4',
      service: 'API Response Time',
      status: '145ms',
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f8f9fa', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: colors.textPrimary }}>
            OCR Dashboard
          </Title>
          <Text type="secondary">
            Welcome back! Monitor your OCR processing activities and statistics.
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Processed"
                value={ocrStats.totalProcessed}
                prefix={<FileImageOutlined />}
                valueStyle={{ color: colors.textPrimary }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +156 this week
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Successful"
                value={ocrStats.successful}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: colors.textPrimary }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {((ocrStats.successful / ocrStats.totalProcessed) * 100).toFixed(1)}% success rate
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={ocrStats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: colors.textBlack }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                In processing queue
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Accuracy Rate"
                value={ocrStats.accuracy}
                prefix={<BarChartOutlined />}
                suffix="%"
                valueStyle={{ color: colors.textPrimary }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Average recognition accuracy
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Quick Actions" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button 
                  type="primary" 
                  block 
                  icon={<UploadOutlined />}
                  size="large"
                  onClick={() => navigate('/ocr')}
                  style={{ background: colors.textPrimary, borderColor: colors.textPrimary }}
                >
                  Upload New Image
                </Button>
                <Button 
                  block 
                  icon={<HistoryOutlined />}
                  size="large"
                  onClick={() => navigate('/ocr')}
                >
                  View Processing History
                </Button>
                <Button 
                  block 
                  icon={<ExportOutlined />}
                  size="large"
                >
                  Export Results
                </Button>
                <Button 
                  block 
                  icon={<ScanOutlined />}
                  size="large"
                  onClick={() => navigate('/ocr')}
                >
                  Process Batch Files
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Recent OCR Activities" style={{ height: '100%' }}>
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                rowKey="id"
                pagination={false}
                size="small"
                style={{
                  fontSize: '13px',
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Processing Performance">
              <Table
                columns={performanceColumns}
                dataSource={performanceData}
                rowKey="key"
                pagination={false}
                size="small"
                showHeader={false}
                style={{
                  fontSize: '13px',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="System Status">
              <Table
                columns={systemStatusColumns}
                dataSource={systemStatusData}
                rowKey="key"
                pagination={false}
                size="small"
                showHeader={false}
                style={{
                  fontSize: '13px',
                }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;

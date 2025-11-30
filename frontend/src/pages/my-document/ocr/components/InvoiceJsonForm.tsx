import React, { useState } from 'react';
import { Typography, Input, Button, Table, Space, Divider, Tag, Card, Tabs } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  LeftOutlined, 
  RightOutlined,
  ShopOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

import type { InvoiceJsonData } from "../types/ocr.types";

interface InvoiceJsonFormProps {
  jsonData: InvoiceJsonData | null;
  pageNumber: number;
  totalPages: number;
  onDataChange: (updatedData: InvoiceJsonData) => void;
  onPageChange: (newPage: number) => void;
}

const InvoiceJsonForm: React.FC<InvoiceJsonFormProps> = ({
  jsonData,
  pageNumber,
  totalPages,
  onDataChange,
  onPageChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>('invoice');

  if (!jsonData) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '100px', color: '#999' }}>
        <p style={{ fontSize: 16 }}>No JSON data available for this page</p>
      </div>
    );
  }

  const handleFieldChange = (section: keyof InvoiceJsonData, field: string, value: string) => {
    const updatedData = { ...jsonData };
    if (!updatedData[section]) {
      (updatedData[section] as any) = {};
    }
    (updatedData[section] as any)[field] = value;
    onDataChange(updatedData);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedData = { ...jsonData };
    const newItems = [...(updatedData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updatedData.items = newItems;
    onDataChange(updatedData);
  };

  const handleAddItem = () => {
    const updatedData = { ...jsonData };
    const newItems = [...(updatedData.items || [])];
    newItems.push({
      stt: (newItems.length + 1).toString(),
      name: '',
      unit: '',
      quantity: '',
      unit_price: '',
      amount: '',
    });
    updatedData.items = newItems;
    onDataChange(updatedData);
  };

  const handleDeleteItem = (index: number) => {
    const updatedData = { ...jsonData };
    const newItems = [...(updatedData.items || [])];
    newItems.splice(index, 1);
    newItems.forEach((item, idx) => {
      item.stt = (idx + 1).toString();
    });
    updatedData.items = newItems;
    onDataChange(updatedData);
  };

  const itemColumns = [
    {
      title: '#',
      dataIndex: 'stt',
      key: 'stt',
      width: 50,
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'stt', e.target.value)}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
        />
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
        />
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (text: string, record: any, index: number) => (
        <Input
          value={text}
          size="small"
          onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (text: any, record: any, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(index)}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#f5f7fa' }}>
      {/* Page Navigation */}
      <div style={{ padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            icon={<LeftOutlined />}
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
            size="small"
          >
            Previous
          </Button>
          <Space>
            <Text strong style={{ fontSize: 14, color: '#1A3636' }}>
              Page {pageNumber} / {totalPages}
            </Text>
            <Tag color="blue" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
              Editable
            </Tag>
          </Space>
          <Button
            icon={<RightOutlined />}
            iconPosition="end"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
            size="small"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'invoice',
              label: (
                <Space>
                  <FileTextOutlined />
                  <span>Invoice</span>
                </Space>
              ),
              children: (
                <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
                  <Card
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e8e8e8',
                      borderRadius: 0,
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Title
                        </Text>
                        <Input
                          value={jsonData.invoice?.title || ''}
                          onChange={(e) => handleFieldChange('invoice', 'title', e.target.value)}
                          placeholder="Invoice title"
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Serial
                          </Text>
                          <Input
                            value={jsonData.invoice?.serial || ''}
                            onChange={(e) => handleFieldChange('invoice', 'serial', e.target.value)}
                            placeholder="Serial"
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Number
                          </Text>
                          <Input
                            value={jsonData.invoice?.number || ''}
                            onChange={(e) => handleFieldChange('invoice', 'number', e.target.value)}
                            placeholder="Invoice number"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Date
                          </Text>
                          <Input
                            value={jsonData.invoice?.date || ''}
                            onChange={(e) => handleFieldChange('invoice', 'date', e.target.value)}
                            placeholder="dd/mm/yyyy"
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            CQT Code
                          </Text>
                          <Input
                            value={jsonData.invoice?.cqt_code || ''}
                            onChange={(e) => handleFieldChange('invoice', 'cqt_code', e.target.value)}
                            placeholder="Mã của CQT"
                          />
                        </div>
                      </div>
                    </Space>
                  </Card>
                </div>
              ),
            },
            {
              key: 'seller',
              label: (
                <Space>
                  <ShopOutlined />
                  <span>Seller</span>
                </Space>
              ),
              children: (
                <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
                  <Card
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e8e8e8',
                      borderRadius: 0,
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Name
                        </Text>
                        <Input
                          value={jsonData.seller?.name || ''}
                          onChange={(e) => handleFieldChange('seller', 'name', e.target.value)}
                          placeholder="Seller name"
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Address
                        </Text>
                        <TextArea
                          value={jsonData.seller?.address || ''}
                          onChange={(e) => handleFieldChange('seller', 'address', e.target.value)}
                          placeholder="Address"
                          rows={2}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Phone
                          </Text>
                          <Input
                            value={jsonData.seller?.phone || ''}
                            onChange={(e) => handleFieldChange('seller', 'phone', e.target.value)}
                            placeholder="Phone"
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Fax
                          </Text>
                          <Input
                            value={jsonData.seller?.fax || ''}
                            onChange={(e) => handleFieldChange('seller', 'fax', e.target.value)}
                            placeholder="Fax"
                          />
                        </div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Tax Code
                        </Text>
                        <Input
                          value={jsonData.seller?.tax_code || ''}
                          onChange={(e) => handleFieldChange('seller', 'tax_code', e.target.value)}
                          placeholder="Tax code"
                        />
                      </div>
                    </Space>
                  </Card>
                </div>
              ),
            },
            {
              key: 'buyer',
              label: (
                <Space>
                  <UserOutlined />
                  <span>Buyer</span>
                </Space>
              ),
              children: (
                <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
                  <Card
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e8e8e8',
                      borderRadius: 0,
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Name
                        </Text>
                        <Input
                          value={jsonData.buyer?.name || ''}
                          onChange={(e) => handleFieldChange('buyer', 'name', e.target.value)}
                          placeholder="Buyer name"
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Unit Name
                        </Text>
                        <Input
                          value={jsonData.buyer?.unit_name || ''}
                          onChange={(e) => handleFieldChange('buyer', 'unit_name', e.target.value)}
                          placeholder="Tên đơn vị"
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            CCCD
                          </Text>
                          <Input
                            value={jsonData.buyer?.cccd || ''}
                            onChange={(e) => handleFieldChange('buyer', 'cccd', e.target.value)}
                            placeholder="Căn cước công dân"
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Passport
                          </Text>
                          <Input
                            value={jsonData.buyer?.passport || ''}
                            onChange={(e) => handleFieldChange('buyer', 'passport', e.target.value)}
                            placeholder="Hộ chiếu"
                          />
                        </div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Tax Code
                        </Text>
                        <Input
                          value={jsonData.buyer?.tax_code || ''}
                          onChange={(e) => handleFieldChange('buyer', 'tax_code', e.target.value)}
                          placeholder="Tax code"
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Address
                        </Text>
                        <TextArea
                          spellCheck={false}
                          value={jsonData.buyer?.address || ''}
                          onChange={(e) => handleFieldChange('buyer', 'address', e.target.value)}
                          placeholder="Address"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Payment Method
                        </Text>
                        <Input
                          value={jsonData.buyer?.payment_method || ''}
                          onChange={(e) => handleFieldChange('buyer', 'payment_method', e.target.value)}
                          placeholder="Payment method"
                        />
                      </div>
                    </Space>
                  </Card>
                </div>
              ),
            },
            {
              key: 'items',
              label: (
                <Space>
                  <ShoppingCartOutlined />
                  <span>Items ({jsonData.items?.length || 0})</span>
                </Space>
              ),
              children: (
                <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
                  <Card
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e8e8e8',
                      borderRadius: 0,
                    }}
                    extra={
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="small" 
                        onClick={handleAddItem}
                      >
                        Add Item
                      </Button>
                    }
                  >
                    <Table
                      columns={itemColumns}
                      dataSource={jsonData.items || []}
                      pagination={false}
                      size="small"
                      bordered
                      rowKey={(record, index) => index?.toString() || '0'}
                      scroll={{ x: 'max-content', y: 400 }}
                    />
                  </Card>
                </div>
              ),
            },
            {
              key: 'totals',
              label: (
                <Space>
                  <DollarOutlined />
                  <span>Totals</span>
                </Space>
              ),
              children: (
                <div style={{ padding: '20px', overflowY: 'auto', height: '100%' }}>
                  <Card
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e8e8e8',
                      borderRadius: 0,
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Subtotal
                          </Text>
                          <Input
                            value={jsonData.totals?.subtotal || ''}
                            onChange={(e) => handleFieldChange('totals', 'subtotal', e.target.value)}
                            placeholder="Subtotal"
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            VAT Rate (%)
                          </Text>
                          <Input
                            value={jsonData.totals?.vat_rate || ''}
                            onChange={(e) => handleFieldChange('totals', 'vat_rate', e.target.value)}
                            placeholder="VAT rate"
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            VAT Amount
                          </Text>
                          <Input
                            value={jsonData.totals?.vat_amount || ''}
                            onChange={(e) => handleFieldChange('totals', 'vat_amount', e.target.value)}
                            placeholder="VAT amount"
                          />
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                            Total
                          </Text>
                          <Input
                            value={jsonData.totals?.total || ''}
                            onChange={(e) => handleFieldChange('totals', 'total', e.target.value)}
                            placeholder="Total"
                            style={{ fontWeight: 600 }}
                          />
                        </div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                          Total in Words
                        </Text>
                        <TextArea
                          value={jsonData.totals?.total_in_words || ''}
                          onChange={(e) => handleFieldChange('totals', 'total_in_words', e.target.value)}
                          placeholder="Total in words"
                          rows={2}
                        />
                      </div>
                    </Space>
                  </Card>
                </div>
              ),
            },
          ]}
          style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            background: '#f5f7fa'
          }}
          tabBarStyle={{ 
            margin: 0, 
            padding: '0 20px',
            background: '#fff',
            borderBottom: '1px solid #e8e8e8'
          }}
        />
      </div>
    </div>
  );
};

export default InvoiceJsonForm;


import React from 'react';
import { Typography, Table, Divider } from 'antd';

const { Title, Text } = Typography;

interface InvoiceJsonData {
  seller?: {
    name?: string;
    address?: string;
    phone?: string;
    fax?: string;
    tax_code?: string;
  };
  invoice?: {
    title?: string;
    serial?: string;
    number?: string;
    date?: string;
    cqt_code?: string;
  };
  buyer?: {
    name?: string;
    unit_name?: string;
    cccd?: string;
    passport?: string;
    tax_code?: string;
    address?: string;
    payment_method?: string;
  };
  items?: Array<{
    stt?: string;
    name?: string;
    unit?: string;
    quantity?: string;
    unit_price?: string;
    amount?: string;
  }>;
  totals?: {
    subtotal?: string;
    vat_rate?: string;
    vat_amount?: string;
    total?: string;
    total_in_words?: string;
  };
}

interface InvoiceJsonFormProps {
  jsonData: InvoiceJsonData | null;
  pageNumber?: number;
  totalPages?: number;
  onDataChange?: (data: InvoiceJsonData) => void;
  onPageChange?: (page: number) => void;
}

function InvoiceJsonForm({ 
  jsonData, 
  pageNumber = 1, 
  totalPages = 1, 
  onDataChange, 
  onPageChange 
}: InvoiceJsonFormProps) {
  // If no data, show empty state
  if (!jsonData) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '100px', color: '#999' }}>
        <p style={{ fontSize: 16 }}>No JSON data available</p>
      </div>
    );
  }

  // Items table columns
  const itemColumns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 50,
      align: 'center' as const,
    },
    {
      title: 'Tên hàng hóa, dịch vụ',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right' as const,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      align: 'right' as const,
      render: (text: string) => text ? Number(text).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (text: string) => text ? Number(text).toLocaleString('vi-VN') : '-',
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e8e8e8'
      }}>
        <div>
          {jsonData.seller?.name && (
            <Title level={4} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A3636' }}>
              {jsonData.seller.name}
            </Title>
          )}
          {jsonData.seller?.tax_code && (
            <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 4 }}>
              Mã số thuế: {jsonData.seller.tax_code}
            </Text>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          {jsonData.invoice?.serial && (
            <Text style={{ fontSize: 13, color: '#666', display: 'block' }}>
              Ký hiệu: {jsonData.invoice.serial}
            </Text>
          )}
          {jsonData.invoice?.number && (
            <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 4 }}>
              Số: {jsonData.invoice.number}
            </Text>
          )}
        </div>
      </div>

      {/* Invoice Title */}
      {jsonData.invoice?.title && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1A3636' }}>
            {jsonData.invoice.title}
          </Title>
        </div>
      )}

      {/* Main Content - 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column - Seller & Buyer */}
        <div>
          {/* Seller Section */}
          {jsonData.seller && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
              <Title level={5} style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#1A3636' }}>
                Đơn vị bán hàng
              </Title>
              <div style={{ lineHeight: '1.8', fontSize: 13 }}>
                {jsonData.seller.name && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Tên đơn vị: </Text>
                    <Text>{jsonData.seller.name}</Text>
                  </div>
                )}
                {jsonData.seller.tax_code && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Mã số thuế: </Text>
                    <Text>{jsonData.seller.tax_code}</Text>
                  </div>
                )}
                {jsonData.seller.address && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Địa chỉ: </Text>
                    <Text>{jsonData.seller.address}</Text>
                  </div>
                )}
                {jsonData.seller.phone && (
                  <div>
                    <Text strong>Điện thoại: </Text>
                    <Text>{jsonData.seller.phone}</Text>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buyer Section */}
          {jsonData.buyer && (
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
              <Title level={5} style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#1A3636' }}>
                MST người mua
              </Title>
              <div style={{ lineHeight: '1.8', fontSize: 13 }}>
                {jsonData.buyer.tax_code && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>MST người mua: </Text>
                    <Text>{jsonData.buyer.tax_code}</Text>
                  </div>
                )}
                {jsonData.buyer.unit_name && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Tên đơn vị: </Text>
                    <Text>{jsonData.buyer.unit_name}</Text>
                  </div>
                )}
                {jsonData.buyer.name && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Người mua hàng: </Text>
                    <Text>{jsonData.buyer.name}</Text>
                  </div>
                )}
                {jsonData.buyer.address && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Địa chỉ: </Text>
                    <Text>{jsonData.buyer.address}</Text>
                  </div>
                )}
                {jsonData.buyer.payment_method && (
                  <div>
                    <Text strong>Hình thức thanh toán: </Text>
                    <Text>{jsonData.buyer.payment_method}</Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Invoice Info */}
        <div>
          {jsonData.invoice && (
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
              <Title level={5} style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#1A3636' }}>
                Thông tin hóa đơn
              </Title>
              <div style={{ lineHeight: '1.8', fontSize: 13 }}>
                {jsonData.invoice.date && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Ngày: </Text>
                    <Text>{jsonData.invoice.date}</Text>
                  </div>
                )}
                {jsonData.invoice.serial && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Ký hiệu: </Text>
                    <Text>{jsonData.invoice.serial}</Text>
                  </div>
                )}
                {jsonData.invoice.number && (
                  <div style={{ marginBottom: 6 }}>
                    <Text strong>Số: </Text>
                    <Text>{jsonData.invoice.number}</Text>
                  </div>
                )}
                {jsonData.invoice.cqt_code && (
                  <div>
                    <Text strong>Mã CQT: </Text>
                    <Text style={{ fontSize: 11 }}>{jsonData.invoice.cqt_code}</Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      {jsonData.items && jsonData.items.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ marginBottom: '12px', fontSize: 14, fontWeight: 600, color: '#1A3636' }}>
            Hàng hóa/Dịch vụ
          </Title>
          <Table
            columns={itemColumns}
            dataSource={jsonData.items || []}
            pagination={false}
            size="small"
            bordered
            rowKey={(record, index) => index?.toString() || record.stt || Math.random().toString()}
            scroll={{ x: 'max-content' }}
            style={{
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          />
        </div>
      )}

      {/* Totals Section */}
      {jsonData.totals && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '400px' }}>
              {jsonData.totals.subtotal && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 8,
                  padding: '6px 0',
                  fontSize: 13
                }}>
                  <Text>Tổng tiền hàng: </Text>
                  <Text strong>{Number(jsonData.totals.subtotal).toLocaleString('vi-VN')}</Text>
                </div>
              )}
              {jsonData.totals.vat_rate && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 8,
                  padding: '6px 0',
                  fontSize: 13
                }}>
                  <Text>Thuế suất GTGT: </Text>
                  <Text>{jsonData.totals.vat_rate}</Text>
                </div>
              )}
              {jsonData.totals.vat_amount && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 8,
                  padding: '6px 0',
                  fontSize: 13
                }}>
                  <Text>Tiền thuế GTGT: </Text>
                  <Text strong>{Number(jsonData.totals.vat_amount).toLocaleString('vi-VN')}</Text>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              {jsonData.totals.total && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: 14
                }}>
                  <Text strong style={{ fontSize: 14 }}>Tổng tiền thanh toán: </Text>
                  <Text strong style={{ fontSize: 14, color: '#1A3636' }}>
                    {Number(jsonData.totals.total).toLocaleString('vi-VN')}
                  </Text>
                </div>
              )}
              {jsonData.totals.total_in_words && (
                <div style={{ 
                  marginTop: 12, 
                  padding: '10px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '4px',
                  fontSize: 12,
                  fontStyle: 'italic',
                  color: '#666'
                }}>
                  <Text>Bằng chữ: {jsonData.totals.total_in_words}</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceJsonForm;

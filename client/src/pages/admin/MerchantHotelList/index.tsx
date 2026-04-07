import { Button, Card, Col, Row, Space, Statistic, Table, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantApi } from '../../../api/hotel';
import { useSseRefresh } from '../../../hooks/useSseRefresh';

const statusColorMap = {
  approved: 'green',
  pending: 'orange',
  rejected: 'red',
};

export default function MerchantHotelListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await merchantApi.listHotels();
      setData(res.data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useSseRefresh(loadData);

  const summary = useMemo(() => {
    const approved = data.filter((item) => item.auditStatus === 'approved').length;
    const pending = data.filter((item) => item.auditStatus === 'pending').length;
    const published = data.filter((item) => item.publishStatus === 'published' && !item.isOffline).length;
    return { total: data.length, approved, pending, published };
  }, [data]);

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="酒店总数" value={summary.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="待审核" value={summary.pending} valueStyle={{ color: '#d97706' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="审核通过" value={summary.approved} valueStyle={{ color: '#059669' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="当前已发布" value={summary.published} valueStyle={{ color: '#2563eb' }} /></Card></Col>
      </Row>

      <Card
        title="我的酒店资产"
        extra={
          <Button type="primary" onClick={() => navigate('/admin/merchant/hotels/new')}>
            新增酒店
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          dataSource={data}
          columns={[
            { title: '酒店名', dataIndex: 'nameZh' },
            { title: '城市', dataIndex: 'city', width: 100 },
            { title: '星级', dataIndex: 'star', width: 100, render: (value) => `${value} 星` },
            {
              title: '审核状态',
              dataIndex: 'auditStatus',
              render: (value, row) => (
                <Tag color={statusColorMap[value]}>
                  {value}
                  {row.auditReason ? `：${row.auditReason}` : ''}
                </Tag>
              ),
            },
            {
              title: '发布状态',
              dataIndex: 'publishStatus',
              render: (value, row) => (
                <Tag color={row.isOffline ? 'red' : value === 'published' ? 'blue' : 'default'}>
                  {row.isOffline ? 'offline' : value}
                </Tag>
              ),
            },
            {
              title: '房型数',
              render: (_, row) => row.roomTypes.length,
              width: 100,
            },
            {
              title: '操作',
              render: (_, row) => (
                <Space>
                  <Button size="small" onClick={() => navigate(`/admin/merchant/hotels/${row.id}/edit`)}>
                    编辑
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
}

import { Button, Card, Col, Descriptions, Drawer, Form, Input, Row, Select, Space, Statistic, Table, Tag, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../../api/hotel';
import { useSseRefresh } from '../../../hooks/useSseRefresh';

const statusColorMap = {
  approved: 'green',
  pending: 'orange',
  rejected: 'red',
};

const actionLabelMap = {
  SEED_INIT: '初始化演示数据',
  CREATE_HOTEL: '创建酒店',
  UPDATE_HOTEL: '修改酒店信息',
  AUDIT_HOTEL: '审核酒店',
  PUBLISH_HOTEL: '发布酒店',
  OFFLINE_HOTEL: '下线酒店',
  RESTORE_HOTEL: '恢复上线',
};

export default function AdminHotelAuditPage({ mode }: { mode?: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonForm] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      if (mode === 'logs') {
        const res = await adminApi.getLogs();
        setLogs(res.data);
      } else {
        const res = await adminApi.listHotels(filters);
        setData(res.data);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mode, JSON.stringify(filters)]);

  useSseRefresh(loadData);

  const summary = useMemo(
    () => ({
      total: data.length,
      pending: data.filter((item) => item.auditStatus === 'pending').length,
      rejected: data.filter((item) => item.auditStatus === 'rejected').length,
      online: data.filter((item) => item.publishStatus === 'published' && !item.isOffline).length,
    }),
    [data]
  );

  const refreshWithMessage = async (promise, text) => {
    try {
      await promise;
      message.success(text);
      loadData();
    } catch (error) {
      message.error(error.message);
    }
  };

  const actionDisabled = (row, action) => {
    if (action === 'approve') return row.auditStatus === 'approved';
    if (action === 'reject') return row.auditStatus === 'rejected';
    if (action === 'publish') return row.auditStatus !== 'approved' || (row.publishStatus === 'published' && !row.isOffline);
    if (action === 'offline') return row.publishStatus !== 'published' || row.isOffline;
    if (action === 'restore') return !row.isOffline;
    return false;
  };

  if (mode === 'logs') {
    return (
      <Card title="操作日志看板">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={logs}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '时间', dataIndex: 'createdAt', render: (value) => new Date(value).toLocaleString() },
            { title: '用户', render: (_, row) => `${row.user.username} (${row.user.role})` },
            { title: '动作', dataIndex: 'action', render: (value) => actionLabelMap[value] || value },
            { title: '详情', dataIndex: 'detail' },
          ]}
        />
      </Card>
    );
  }

  return (
    <>
      <Space direction="vertical" size={18} style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={6}><Card><Statistic title="酒店总数" value={summary.total} /></Card></Col>
          <Col span={6}><Card><Statistic title="待审核" value={summary.pending} valueStyle={{ color: '#d97706' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="审核驳回" value={summary.rejected} valueStyle={{ color: '#dc2626' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="当前在线" value={summary.online} valueStyle={{ color: '#2563eb' }} /></Card></Col>
        </Row>

        <Card
          title="酒店审核与发布中心"
          extra={
            <Space>
              <Select
                style={{ width: 150 }}
                placeholder="审核状态"
                allowClear
                onChange={(value) => setFilters((prev) => ({ ...prev, auditStatus: value }))}
                options={['pending', 'approved', 'rejected'].map((item) => ({ label: item, value: item }))}
              />
              <Select
                style={{ width: 150 }}
                placeholder="发布状态"
                allowClear
                onChange={(value) => setFilters((prev) => ({ ...prev, publishStatus: value }))}
                options={['draft', 'published', 'offline'].map((item) => ({ label: item, value: item }))}
              />
            </Space>
          }
        >
          <Table
            rowKey="id"
            loading={loading}
            dataSource={data}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: '酒店名', dataIndex: 'nameZh', width: 220 },
              { title: '商户', render: (_, row) => row.merchant.username, width: 120 },
              { title: '城市', dataIndex: 'city', width: 100 },
              {
                title: '审核状态',
                render: (_, row) => <Tag color={statusColorMap[row.auditStatus]}>{row.auditStatus}</Tag>,
              },
              {
                title: '发布状态',
                render: (_, row) => (
                  <Tag color={row.isOffline ? 'red' : row.publishStatus === 'published' ? 'blue' : 'default'}>
                    {row.isOffline ? 'offline' : row.publishStatus}
                  </Tag>
                ),
              },
              {
                title: '操作',
                width: 420,
                render: (_, row) => (
                  <Space wrap>
                    <Button size="small" onClick={() => setSelected(row)}>查看详情</Button>
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      disabled={actionDisabled(row, 'approve')}
                      onClick={() => refreshWithMessage(adminApi.auditHotel(row.id, { auditStatus: 'approved' }), '审核通过')}
                    >
                      通过
                    </Button>
                    <Button
                      size="small"
                      danger
                      disabled={actionDisabled(row, 'reject')}
                      onClick={() => {
                        setSelected(row);
                        setReasonOpen(true);
                      }}
                    >
                      驳回
                    </Button>
                    <Button size="small" disabled={actionDisabled(row, 'publish')} onClick={() => refreshWithMessage(adminApi.publishHotel(row.id), '发布成功')}>发布</Button>
                    <Button size="small" disabled={actionDisabled(row, 'offline')} onClick={() => refreshWithMessage(adminApi.offlineHotel(row.id), '下线成功')}>下线</Button>
                    <Button size="small" disabled={actionDisabled(row, 'restore')} onClick={() => refreshWithMessage(adminApi.restoreHotel(row.id), '恢复上线成功')}>恢复</Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </Space>

      <Drawer title={selected?.nameZh} open={!!selected} onClose={() => setSelected(null)} width={560}>
        {selected && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="地址">{selected.address}</Descriptions.Item>
              <Descriptions.Item label="描述">{selected.description}</Descriptions.Item>
              <Descriptions.Item label="标签">{selected.tags.join(' / ')}</Descriptions.Item>
              <Descriptions.Item label="设施">{selected.facilities.join(' / ')}</Descriptions.Item>
              <Descriptions.Item label="周边">{selected.nearbyInfo.join(' / ')}</Descriptions.Item>
              <Descriptions.Item label="优惠">{selected.discountInfo}</Descriptions.Item>
              <Descriptions.Item label="审核原因">{selected.auditReason || '无'}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <strong>房型信息</strong>
              {selected.roomTypes.map((room) => (
                <Card key={room.id} size="small" style={{ marginTop: 8 }}>
                  {room.roomName} | ¥{room.price} | 库存 {room.stock}
                </Card>
              ))}
            </div>
          </>
        )}
      </Drawer>

      <Drawer title="填写驳回原因" open={reasonOpen} onClose={() => setReasonOpen(false)} width={420}>
        <Form
          form={reasonForm}
          layout="vertical"
          onFinish={(values) => {
            refreshWithMessage(adminApi.auditHotel(selected.id, { auditStatus: 'rejected', auditReason: values.auditReason }), '已驳回');
            setReasonOpen(false);
            reasonForm.resetFields();
          }}
        >
          <Form.Item label="驳回原因" name="auditReason" rules={[{ required: true, message: '请填写原因' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit">确认提交</Button>
        </Form>
      </Drawer>
    </>
  );
}

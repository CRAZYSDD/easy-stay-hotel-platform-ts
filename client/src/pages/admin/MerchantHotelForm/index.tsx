import { Button, Card, Checkbox, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Switch, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { merchantApi } from '../../../api/hotel';

const tagOptions = ['亲子', '豪华', '免费停车', '商务', '近地铁', '江景', '温泉'];
const facilityOptions = ['WiFi', '早餐', '健身房', '游泳池', '停车场', '会议室', '洗衣服务'];
const cityOptions = ['上海', '北京', '杭州', '深圳', '成都', '南京'];

export default function MerchantHotelFormPage() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    merchantApi
      .getHotel(id)
      .then((res) => form.setFieldsValue(res.data))
      .catch((error) => message.error(error.message));
  }, [form, id]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        galleryImages: values.galleryImages.filter(Boolean),
        nearbyInfo: values.nearbyInfo.filter(Boolean),
      };
      if (id) {
        await merchantApi.updateHotel(id, payload);
      } else {
        await merchantApi.createHotel(payload);
      }
      message.success('保存成功，已提交审核');
      navigate('/admin/merchant/hotels');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={id ? '编辑酒店资料' : '新增酒店资料'}>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          city: '上海',
          star: 4,
          openYear: 2020,
          tags: ['商务'],
          facilities: ['WiFi', '早餐'],
          galleryImages: ['https://picsum.photos/seed/merchant-gallery-default/1200/800'],
          nearbyInfo: ['距地铁站 500 米', '步行可达商场', '适合城市漫游'],
          publishStatus: 'draft',
          roomTypes: [
            {
              roomName: '高级大床房',
              bedType: '1.8m 大床',
              breakfastIncluded: true,
              cancelPolicy: '入住前 1 天免费取消',
              price: 399,
              originalPrice: 499,
              stock: 5,
              roomArea: 28,
              maxGuests: 2,
              roomImage: 'https://picsum.photos/seed/merchant-room-default/600/420',
            },
          ],
        }}
      >
        <Card type="inner" title="基础信息">
          <Row gutter={16}>
            <Col span={12}><Form.Item label="酒店中文名" name="nameZh" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="酒店英文名" name="nameEn" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item label="城市" name="city" rules={[{ required: true }]}><Select options={cityOptions.map((item) => ({ label: item, value: item }))} /></Form.Item></Col>
            <Col span={8}><Form.Item label="星级" name="star" rules={[{ required: true }]}><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item label="开业年份" name="openYear" rules={[{ required: true }]}><InputNumber min={1990} max={2030} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Form.Item label="地址" name="address" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={24}><Form.Item label="酒店描述" name="description" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item></Col>
            <Col span={12}><Form.Item label="封面图 URL" name="coverImage" rules={[{ required: true, type: 'url' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="发布设置" name="publishStatus"><Select options={[{ label: '保存草稿', value: 'draft' }, { label: '审核通过后直接发布', value: 'published' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item label="酒店标签" name="tags"><Checkbox.Group options={tagOptions} /></Form.Item></Col>
            <Col span={12}><Form.Item label="酒店设施" name="facilities"><Checkbox.Group options={facilityOptions} /></Form.Item></Col>
          </Row>
        </Card>

        <Divider />

        <Form.List name="galleryImages">
          {(fields, { add, remove }) => (
            <Card type="inner" title="图片库">
              {fields.map((field) => (
                <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item {...field} rules={[{ required: true, type: 'url' }]} style={{ minWidth: 540 }}>
                    <Input placeholder="图片 URL" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add()}>新增图片</Button>
            </Card>
          )}
        </Form.List>

        <Divider />

        <Form.List name="nearbyInfo">
          {(fields, { add, remove }) => (
            <Card type="inner" title="周边信息">
              {fields.map((field) => (
                <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                  <Form.Item {...field} rules={[{ required: true }]} style={{ minWidth: 540 }}>
                    <Input placeholder="如：距离地铁站 300 米" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add()}>新增周边信息</Button>
            </Card>
          )}
        </Form.List>

        <Divider />

        <Form.Item label="优惠信息" name="discountInfo">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.List name="roomTypes">
          {(fields, { add, remove }) => (
            <Card
              type="inner"
              title="房型列表"
              extra={<Button icon={<PlusOutlined />} onClick={() => add({ breakfastIncluded: false, stock: 3, maxGuests: 2, roomArea: 25, price: 399, originalPrice: 499 })}>新增房型</Button>}
            >
              {fields.map((field) => (
                <Card key={field.key} type="inner" style={{ marginBottom: 12 }} extra={<MinusCircleOutlined onClick={() => remove(field.name)} />}>
                  <Row gutter={16}>
                    <Col span={6}><Form.Item {...field} name={[field.name, 'roomName']} label="房型名" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={6}><Form.Item {...field} name={[field.name, 'bedType']} label="床型" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={4}><Form.Item {...field} name={[field.name, 'price']} label="价格" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={4}><Form.Item {...field} name={[field.name, 'originalPrice']} label="原价" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={4}><Form.Item {...field} name={[field.name, 'stock']} label="库存" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={4}><Form.Item {...field} name={[field.name, 'roomArea']} label="面积" rules={[{ required: true }]}><InputNumber min={10} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={4}><Form.Item {...field} name={[field.name, 'maxGuests']} label="入住人数" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item {...field} name={[field.name, 'cancelPolicy']} label="取消规则" rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={4}><Form.Item {...field} name={[field.name, 'breakfastIncluded']} label="含早餐" valuePropName="checked"><Switch /></Form.Item></Col>
                    <Col span={24}><Form.Item {...field} name={[field.name, 'roomImage']} label="房型图 URL" rules={[{ required: true, type: 'url' }]}><Input /></Form.Item></Col>
                    <Col span={24}><Form.Item {...field} name={[field.name, 'id']} hidden><Input /></Form.Item></Col>
                  </Row>
                </Card>
              ))}
            </Card>
          )}
        </Form.List>

        <Space style={{ marginTop: 20 }}>
          <Button onClick={() => navigate('/admin/merchant/hotels')}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>保存酒店</Button>
        </Space>
      </Form>
    </Card>
  );
}

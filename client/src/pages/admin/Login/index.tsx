import { Button, Card, Divider, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/hotel';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../../store/slices/authSlice';

const shellStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'radial-gradient(circle at top right, rgba(249,115,22,0.16), transparent 18%), linear-gradient(135deg, #e6f7f4 0%, #f8fbfd 52%, #fff3e7 100%)',
};

const cardStyle = { width: 460, borderRadius: 24, boxShadow: '0 24px 60px rgba(15, 39, 54, 0.12)' };

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      const res = await authApi.login(values);
      dispatch(setAuth(res.data));
      message.success('登录成功');
      navigate(res.data.user.role === 'merchant' ? '/admin/merchant/hotels' : '/admin/audit');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div style={shellStyle}>
      <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0f766e' }}>易宿后台</div>
          <div style={{ marginTop: 8, color: '#6b7f89', lineHeight: 1.7 }}>
            用于演示酒店审核、发布、房型维护和实时同步的后台系统。
          </div>
        </div>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin', password: '123456' }}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input size="large" placeholder="请输入账号" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>
          <Button block type="primary" size="large" htmlType="submit">
            登录后台
          </Button>
        </Form>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5f7682', fontSize: 13 }}>
          <span>演示账号：admin / 123456</span>
          <Link to="/admin/register">注册新账号</Link>
        </div>
      </Card>
    </div>
  );
}

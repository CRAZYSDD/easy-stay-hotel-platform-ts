import { Button, Card, Divider, Form, Input, Radio, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/hotel';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../../store/slices/authSlice';

const shellStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'radial-gradient(circle at top left, rgba(15,118,110,0.14), transparent 18%), linear-gradient(135deg, #e6f7f4 0%, #f8fbfd 52%, #fff3e7 100%)',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      const res = await authApi.register(values);
      dispatch(setAuth(res.data));
      message.success('注册成功');
      navigate(values.role === 'merchant' ? '/admin/merchant/hotels' : '/admin/audit');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div style={shellStyle}>
      <Card style={{ width: 500, borderRadius: 24, boxShadow: '0 24px 60px rgba(15, 39, 54, 0.12)' }} styles={{ body: { padding: 32 } }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0f766e' }}>创建后台账号</div>
          <div style={{ marginTop: 8, color: '#6b7f89', lineHeight: 1.7 }}>
            注册时选择角色，登录后系统会自动识别并进入对应后台。
          </div>
        </div>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: 'merchant' }}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }, { min: 3, message: '至少 3 位' }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 位' }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Radio.Group
              options={[
                { label: '商户：维护酒店和房型', value: 'merchant' },
                { label: '管理员：审核、发布和运营', value: 'admin' },
              ]}
            />
          </Form.Item>
          <Button block type="primary" size="large" htmlType="submit">
            注册并进入后台
          </Button>
        </Form>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Link to="/admin/login">返回登录</Link>
        </div>
      </Card>
    </div>
  );
}

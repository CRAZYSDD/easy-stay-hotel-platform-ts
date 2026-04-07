import { AppstoreOutlined, AuditOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, Space, Tag } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/slices/authSlice';
import ScrollToTop from '../components/common/ScrollToTop';
import styles from './AdminLayout.module.css';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<any>();
  const user = useSelector((state: any) => state.auth.user);

  const menuItems =
    user?.role === 'merchant'
      ? [{ key: '/admin/merchant/hotels', icon: <AppstoreOutlined />, label: '我的酒店' }]
      : [
          { key: '/admin/audit', icon: <AuditOutlined />, label: '审核与发布' },
          { key: '/admin/logs', icon: <FileTextOutlined />, label: '操作日志' },
        ];

  return (
    <Layout className={styles.shell}>
      <ScrollToTop />
      <Sider width={250} className={styles.sider}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>易宿</div>
          <div>
            <strong>酒店管理后台</strong>
            <span>EasyStay Console</span>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <Tag color={user?.role === 'admin' ? 'gold' : 'cyan'}>{user?.role === 'admin' ? '管理员' : '商户'}</Tag>
          <p>{user?.role === 'admin' ? '处理审核、发布与运营动作' : '维护酒店资料、房型和价格'}</p>
        </div>

        <Menu
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          className={styles.menu}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div>
            <strong>{user?.role === 'admin' ? '运营控制台' : '商户工作台'}</strong>
            <span>{user?.role === 'admin' ? '酒店审核状态、上下线流转、日志可视化' : '统一维护酒店资料并提交审核'}</span>
          </div>
          <Space size={14}>
            <div className={styles.userBox}>
              <Avatar style={{ backgroundColor: '#0f766e' }}>{user?.username?.slice(0, 1)?.toUpperCase()}</Avatar>
              <div>
                <strong>{user?.username}</strong>
                <span>{user?.role === 'admin' ? '系统管理员' : '酒店商户'}</span>
              </div>
            </div>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                dispatch(clearAuth());
                navigate('/admin/login');
              }}
            >
              退出登录
            </Button>
          </Space>
        </Header>

        <Content className={styles.content} data-scroll-root>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

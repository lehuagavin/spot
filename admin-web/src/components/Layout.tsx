/**
 * 后台布局组件 - Apple 风格设计
 */
import { Layout as AntLayout, Menu, Avatar, Dropdown, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  PictureOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = AntLayout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, admin, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const menuItems: MenuItem[] = [
    getItem('仪表盘', '/dashboard', <DashboardOutlined />),
    getItem('小区管理', '/community', <EnvironmentOutlined />, [
      getItem('小区列表', '/community/list'),
    ]),
    getItem('教练管理', '/teacher', <TeamOutlined />, [
      getItem('教练列表', '/teacher/list'),
    ]),
    getItem('课程管理', '/course', <BookOutlined />, [
      getItem('课程列表', '/course/list'),
    ]),
    getItem('订单管理', '/order', <ShoppingCartOutlined />, [
      getItem('订单列表', '/order/list'),
    ]),
    getItem('用户管理', '/user', <UserOutlined />, [
      getItem('用户列表', '/user/list'),
    ]),
    getItem('会员管理', '/member', <CrownOutlined />, [
      getItem('权益卡管理', '/member/cards'),
      getItem('购买记录', '/member/records'),
    ]),
    getItem('系统设置', '/system', <PictureOutlined />, [
      getItem('轮播图管理', '/system/banners'),
    ]),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      logout();
      navigate('/login');
      setLoading(false);
    }, 300);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 获取当前选中的菜单项和展开的子菜单
  const selectedKeys = [location.pathname];
  const openKeys = menuItems
    .filter((item): item is MenuItem & { children?: MenuItem[] } => 
      item !== null && 'children' in item && item.children !== undefined
    )
    .filter(item => 
      item.children?.some((child) => 
        child !== null && 'key' in child && location.pathname.startsWith(child.key as string)
      )
    )
    .map(item => item?.key as string);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Spin spinning={loading} tip="正在退出...">
      <AntLayout style={{ minHeight: '100vh' }}>
        {/* 侧边栏 */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          {/* Logo */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? 0 : '0 20px',
              borderBottom: '1px solid var(--color-border-light)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #0071e3 0%, #42a1ff 100%)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18, color: '#fff', fontWeight: 600 }}>Y</span>
            </div>
            {!collapsed && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                义城上门教育
              </span>
            )}
          </div>

          {/* 菜单 */}
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              height: 'calc(100% - 64px)',
              borderRight: 0,
              overflowY: 'auto',
              paddingTop: 8,
            }}
          />
        </Sider>

        {/* 主内容区 */}
        <AntLayout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
          {/* 顶部导航 */}
          <Header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              height: 64,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: 18,
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-secondary)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            </div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    marginRight: 8,
                  }}
                  size={32}
                  icon={<UserOutlined />}
                />
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {admin?.name || admin?.username || '管理员'}
                </span>
              </div>
            </Dropdown>
          </Header>

          {/* 内容区 */}
          <Content
            style={{
              margin: 'var(--spacing-lg)',
              minHeight: 'calc(100vh - 64px - 48px)',
            }}
          >
            <div
              style={{
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                minHeight: '100%',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Outlet />
            </div>
          </Content>
        </AntLayout>
      </AntLayout>
    </Spin>
  );
}

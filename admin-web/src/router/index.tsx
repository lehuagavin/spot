/**
 * 路由配置
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import Layout from '../components/Layout';
import Login from '../pages/Login';

// 懒加载组件
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CommunityList = lazy(() => import('../pages/community/List'));
const TeacherList = lazy(() => import('../pages/teacher/List'));
const CourseList = lazy(() => import('../pages/course/List'));
const OrderList = lazy(() => import('../pages/order/List'));
const OrderDetail = lazy(() => import('../pages/order/Detail'));
const UserList = lazy(() => import('../pages/user/List'));
const UserDetail = lazy(() => import('../pages/user/Detail'));
const MemberCards = lazy(() => import('../pages/member/Cards'));
const MemberRecords = lazy(() => import('../pages/member/Records'));
const Banners = lazy(() => import('../pages/system/Banners'));

// 加载占位
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    minHeight: 200 
  }}>
    <Spin size="large" />
  </div>
);

// 包装懒加载组件
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: withSuspense(Dashboard),
      },
      // 小区管理
      {
        path: 'community/list',
        element: withSuspense(CommunityList),
      },
      // 教练管理
      {
        path: 'teacher/list',
        element: withSuspense(TeacherList),
      },
      // 课程管理
      {
        path: 'course/list',
        element: withSuspense(CourseList),
      },
      // 订单管理
      {
        path: 'order/list',
        element: withSuspense(OrderList),
      },
      {
        path: 'order/detail/:id',
        element: withSuspense(OrderDetail),
      },
      // 用户管理
      {
        path: 'user/list',
        element: withSuspense(UserList),
      },
      {
        path: 'user/detail/:id',
        element: withSuspense(UserDetail),
      },
      // 会员管理
      {
        path: 'member/cards',
        element: withSuspense(MemberCards),
      },
      {
        path: 'member/records',
        element: withSuspense(MemberRecords),
      },
      // 系统设置
      {
        path: 'system/banners',
        element: withSuspense(Banners),
      },
    ],
  },
]);

export default router;

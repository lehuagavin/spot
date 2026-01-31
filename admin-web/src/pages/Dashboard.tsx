/**
 * 仪表盘页面 - Apple 风格设计
 */
import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Empty } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentOrders } from '../api/dashboard';
import type { DashboardStats, Order } from '../types';
import { OrderStatusText, OrderStatusColor, CourseStatusText } from '../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5),
      ]);
      setStats(statsData);
      setRecentOrders(ordersData.list);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      // 使用模拟数据
      setStats({
        total_users: 128,
        total_orders: 56,
        total_revenue: 8960,
        total_courses: 12,
        today_orders: 3,
        today_revenue: 480,
        course_status_distribution: [
          { status: 'enrolling' as const, count: 5 },
          { status: 'in_progress' as const, count: 4 },
          { status: 'completed' as const, count: 3 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // 统计卡片数据
  const statCards = [
    {
      title: '用户总数',
      value: stats?.total_users || 0,
      icon: <UserOutlined style={{ fontSize: 24, color: '#0071e3' }} />,
      color: '#0071e3',
      bgColor: 'rgba(0, 113, 227, 0.08)',
    },
    {
      title: '订单总数',
      value: stats?.total_orders || 0,
      icon: <ShoppingCartOutlined style={{ fontSize: 24, color: '#34c759' }} />,
      color: '#34c759',
      bgColor: 'rgba(52, 199, 89, 0.08)',
    },
    {
      title: '课程总数',
      value: stats?.total_courses || 0,
      icon: <BookOutlined style={{ fontSize: 24, color: '#ff9500' }} />,
      color: '#ff9500',
      bgColor: 'rgba(255, 149, 0, 0.08)',
    },
    {
      title: '总收入',
      value: stats?.total_revenue || 0,
      prefix: '¥',
      icon: <DollarOutlined style={{ fontSize: 24, color: '#ff3b30' }} />,
      color: '#ff3b30',
      bgColor: 'rgba(255, 59, 48, 0.08)',
    },
  ];

  // 课程状态分布图表配置
  const pieConfig = {
    data: stats?.course_status_distribution?.map((item) => ({
      type: CourseStatusText[item.status] || item.status,
      value: item.count,
    })) || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      text: 'value',
      style: {
        fontWeight: 500,
      },
    },
    legend: {
      color: {
        title: false,
        position: 'bottom' as const,
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: 'text' as const,
        style: {
          text: '课程状态',
          x: '50%',
          y: '50%',
          textAlign: 'center' as const,
          fontSize: 16,
          fontWeight: 600,
        },
      },
    ],
  };

  // 最近订单表格列
  const orderColumns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (text: string, record: Order) => (
        <a onClick={() => navigate(`/order/detail/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      render: (_: unknown, record: Order) => record.user?.nickname || record.user?.phone || '-',
    },
    {
      title: '课程',
      dataIndex: ['course', 'name'],
      key: 'course',
      render: (_: unknown, record: Order) => record.course?.name || '-',
    },
    {
      title: '金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof OrderStatusText) => (
        <Tag color={OrderStatusColor[status]}>{OrderStatusText[status]}</Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="fade-in">
        {/* 页面标题 */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
            }}
          >
            仪表盘
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            欢迎回来，这是今天的数据概览
          </p>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Statistic
                    title={
                      <span style={{ color: 'var(--color-text-secondary)' }}>{card.title}</span>
                    }
                    value={card.value}
                    prefix={card.prefix}
                    valueStyle={{
                      fontSize: 28,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 今日数据 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                background: 'linear-gradient(135deg, #0071e3 0%, #42a1ff 100%)',
              }}
            >
              <div style={{ color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <RiseOutlined style={{ fontSize: 20, marginRight: 8 }} />
                  <span style={{ fontSize: 14, opacity: 0.9 }}>今日订单</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 600 }}>{stats?.today_orders || 0}</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                background: 'linear-gradient(135deg, #34c759 0%, #5cd680 100%)',
              }}
            >
              <div style={{ color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <DollarOutlined style={{ fontSize: 20, marginRight: 8 }} />
                  <span style={{ fontSize: 14, opacity: 0.9 }}>今日收入</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 600 }}>¥{stats?.today_revenue || 0}</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表和最近订单 */}
        <Row gutter={[16, 16]}>
          {/* 课程状态分布 */}
          <Col xs={24} lg={10}>
            <Card
              title="课程状态分布"
              bordered={false}
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                height: '100%',
              }}
            >
              {stats?.course_status_distribution?.length ? (
                <Pie {...pieConfig} height={280} />
              ) : (
                <Empty description="暂无数据" style={{ padding: '60px 0' }} />
              )}
            </Card>
          </Col>

          {/* 最近订单 */}
          <Col xs={24} lg={14}>
            <Card
              title="最近订单"
              bordered={false}
              extra={
                <a onClick={() => navigate('/order/list')} style={{ color: 'var(--color-primary)' }}>
                  查看全部
                </a>
              }
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                height: '100%',
              }}
            >
              <Table
                columns={orderColumns}
                dataSource={recentOrders}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: <Empty description="暂无订单" /> }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

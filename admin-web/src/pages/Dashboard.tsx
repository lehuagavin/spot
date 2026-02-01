/**
 * 仪表盘页面 - 现代化设计
 */
import { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Spin, Progress } from 'antd';
import EmptyState from '../components/EmptyState';
import {
  UserOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
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
      setRecentOrders(ordersData.items);
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
          { status: 'ongoing' as const, count: 4 },
          { status: 'completed' as const, count: 3 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  // 统计卡片数据
  const statCards = [
    {
      title: '用户总数',
      value: stats?.total_users || 0,
      icon: <UserOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      lightBg: 'rgba(102, 126, 234, 0.1)',
      onClick: () => navigate('/user/list'),
    },
    {
      title: '订单总数',
      value: stats?.total_orders || 0,
      icon: <ShoppingCartOutlined />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      lightBg: 'rgba(17, 153, 142, 0.1)',
      onClick: () => navigate('/order/list'),
    },
    {
      title: '课程总数',
      value: stats?.total_courses || 0,
      icon: <BookOutlined />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      lightBg: 'rgba(245, 87, 108, 0.1)',
      onClick: () => navigate('/course/list'),
    },
    {
      title: '总收入',
      value: stats?.total_revenue || 0,
      prefix: '¥',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      lightBg: 'rgba(250, 112, 154, 0.1)',
      onClick: () => navigate('/order/list'),
    },
  ];

  // 课程状态颜色映射
  const statusColorMap: Record<string, string> = {
    '招生中': '#667eea',
    '进行中': '#11998e',
    '已完成': '#f5576c',
  };

  // 课程状态分布图表配置
  const pieConfig = {
    data: stats?.course_status_distribution?.map((item) => ({
      type: CourseStatusText[item.status] || item.status,
      value: item.count,
    })) || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.65,
    color: ({ type }: { type: string }) => statusColorMap[type] || '#8884d8',
    label: {
      text: 'value',
      style: {
        fontWeight: 600,
        fill: '#fff',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'bottom' as const,
        rowPadding: 8,
        itemMarker: 'circle',
      },
    },
    annotations: [
      {
        type: 'text' as const,
        style: {
          text: '课程',
          x: '50%',
          y: '46%',
          textAlign: 'center' as const,
          fontSize: 14,
          fontWeight: 400,
          fill: '#86909c',
        },
      },
      {
        type: 'text' as const,
        style: {
          text: String(stats?.total_courses || 0),
          x: '50%',
          y: '54%',
          textAlign: 'center' as const,
          fontSize: 24,
          fontWeight: 700,
          fill: '#1d2129',
        },
      },
    ],
  };

  // 最近订单表格列
  const orderColumns: ColumnsType<Order> = [
    {
      title: '订单信息',
      key: 'order_info',
      render: (_: unknown, record: Order) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <a 
            onClick={() => navigate(`/order/detail/${record.id}`)}
            style={{ fontWeight: 500, color: '#1d2129' }}
          >
            {record.order_no}
          </a>
          <span style={{ fontSize: 12, color: '#86909c' }}>
            {record.user?.nickname || record.user?.phone || '-'}
          </span>
        </div>
      ),
    },
    {
      title: '课程',
      dataIndex: ['course', 'name'],
      key: 'course',
      render: (_: unknown, record: Order) => (
        <span style={{ 
          color: '#4e5969',
          maxWidth: 150,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        }}>
          {record.course?.name || '-'}
        </span>
      ),
    },
    {
      title: '金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#1d2129' }}>
          ¥{Number(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof OrderStatusText) => (
        <Tag 
          color={OrderStatusColor[status]}
          style={{ borderRadius: 4, fontWeight: 500 }}
        >
          {OrderStatusText[status]}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => (
        <span style={{ color: '#86909c', fontSize: 13 }}>
          {dayjs(time).format('MM-DD HH:mm')}
        </span>
      ),
    },
  ];

  // 计算课程状态百分比
  const totalCourses = stats?.course_status_distribution?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <Spin spinning={loading}>
      <div className="fade-in" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* 页面标题区域 */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#1d2129',
            marginBottom: 8,
            letterSpacing: '-0.5px',
          }}>
            数据概览
          </h1>
          <p style={{ 
            color: '#86909c', 
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <ClockCircleOutlined />
            最后更新: {dayjs().format('YYYY年MM月DD日 HH:mm')}
          </p>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                bordered={false}
                hoverable
                onClick={card.onClick}
                style={{
                  borderRadius: 16,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{
                  padding: '24px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: card.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      color: '#86909c', 
                      fontSize: 13,
                      marginBottom: 6,
                      fontWeight: 500,
                    }}>
                      {card.title}
                    </div>
                    <div style={{ 
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#1d2129',
                      lineHeight: 1.2,
                      letterSpacing: '-0.5px',
                    }}>
                      {card.prefix}{formatNumber(card.value)}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 今日数据 */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: '28px 24px', color: '#fff' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <RiseOutlined style={{ fontSize: 20 }} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.95 }}>今日订单</span>
                  </div>
                  <div 
                    onClick={() => navigate('/order/list')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4,
                      cursor: 'pointer',
                      opacity: 0.8,
                      fontSize: 13,
                    }}
                  >
                    查看详情 <ArrowRightOutlined />
                  </div>
                </div>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 700, 
                  lineHeight: 1,
                  letterSpacing: '-1px',
                }}>
                  {stats?.today_orders || 0}
                </div>
                <div style={{ 
                  marginTop: 12, 
                  fontSize: 13, 
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span>累计 {stats?.total_orders || 0} 单</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: '28px 24px', color: '#fff' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <DollarOutlined style={{ fontSize: 20 }} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.95 }}>今日收入</span>
                  </div>
                  <div 
                    onClick={() => navigate('/order/list')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4,
                      cursor: 'pointer',
                      opacity: 0.8,
                      fontSize: 13,
                    }}
                  >
                    查看详情 <ArrowRightOutlined />
                  </div>
                </div>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 700, 
                  lineHeight: 1,
                  letterSpacing: '-1px',
                }}>
                  ¥{formatNumber(stats?.today_revenue || 0)}
                </div>
                <div style={{ 
                  marginTop: 12, 
                  fontSize: 13, 
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span>累计 ¥{formatNumber(stats?.total_revenue || 0)}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表和最近订单 */}
        <Row gutter={[20, 20]}>
          {/* 课程状态分布 */}
          <Col xs={24} lg={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                height: '100%',
              }}
              styles={{ header: { border: 'none', paddingBottom: 0 }, body: { paddingTop: 12 } }}
              title={
                <span style={{ fontSize: 16, fontWeight: 600, color: '#1d2129' }}>
                  课程状态分布
                </span>
              }
              extra={
                <span 
                  onClick={() => navigate('/course/list')}
                  style={{ 
                    color: '#667eea', 
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  查看全部
                </span>
              }
            >
              {stats?.course_status_distribution?.length ? (
                <div>
                  <Pie {...pieConfig} height={200} />
                  <div style={{ marginTop: 16 }}>
                    {stats.course_status_distribution.map((item, index) => {
                      const statusText = CourseStatusText[item.status] || item.status;
                      const percent = totalCourses > 0 ? Math.round((item.count / totalCourses) * 100) : 0;
                      const color = statusColorMap[statusText] || '#8884d8';
                      return (
                        <div key={index} style={{ marginBottom: 12 }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 6,
                          }}>
                            <span style={{ color: '#4e5969', fontSize: 13 }}>{statusText}</span>
                            <span style={{ color: '#1d2129', fontWeight: 600, fontSize: 13 }}>
                              {item.count} 门 ({percent}%)
                            </span>
                          </div>
                          <Progress 
                            percent={percent} 
                            showInfo={false}
                            strokeColor={color}
                            trailColor="#f2f3f5"
                            size="small"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState description="暂无课程数据" imageSize={100} />
              )}
            </Card>
          </Col>

          {/* 最近订单 */}
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                height: '100%',
              }}
              styles={{ header: { border: 'none', paddingBottom: 0 }, body: { paddingTop: 12 } }}
              title={
                <span style={{ fontSize: 16, fontWeight: 600, color: '#1d2129' }}>
                  最近订单
                </span>
              }
              extra={
                <span 
                  onClick={() => navigate('/order/list')} 
                  style={{ 
                    color: '#667eea', 
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  查看全部
                </span>
              }
            >
              <Table
                columns={orderColumns}
                dataSource={recentOrders}
                rowKey="id"
                pagination={false}
                size="middle"
                style={{ 
                  borderRadius: 8,
                }}
                locale={{ emptyText: <EmptyState description="暂无订单" imageSize={80} /> }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}

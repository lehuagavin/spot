/**
 * 用户详情页面
 */
import { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Button, Spin, message, List, Avatar, Table, Tabs } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, getUserStudents, getUserOrders } from '../../api/users';
import { getImageUrl } from '../../api/upload';
import type { User, Student, Order } from '../../types';
import { OrderStatusText, OrderStatusColor } from '../../types';
import dayjs from 'dayjs';

export default function UserDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUser(id!);
      setUser(data);
      fetchStudents();
      fetchOrders();
    } catch (error) {
      message.error('获取用户详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const data = await getUserStudents(id!);
      setStudents(data);
    } catch (error) {
      console.error('获取学员列表失败:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getUserOrders(id!);
      setOrders(data.list);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

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
      title: '课程',
      key: 'course',
      render: (_, record) => record.course?.name || '-',
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <p>用户不存在</p>
        <Button onClick={() => navigate('/user/list')}>返回列表</Button>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'students',
      label: `学员 (${students.length})`,
      children: (
        <List
          loading={studentsLoading}
          dataSource={students}
          locale={{ emptyText: '暂无学员' }}
          renderItem={(student) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={getImageUrl(student.photo)}
                    icon={<UserOutlined />}
                    size={48}
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                }
                title={student.id_name}
                description={
                  <div>
                    <span style={{ marginRight: 16 }}>
                      {student.gender === 'male' ? '男' : '女'}
                    </span>
                    <span style={{ marginRight: 16 }}>
                      {dayjs(student.birthday).format('YYYY-MM-DD')}
                    </span>
                    <Tag color={student.member_type === 'vip' ? 'gold' : 'default'}>
                      {student.member_type === 'vip' ? 'VIP会员' : '普通会员'}
                    </Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'orders',
      label: `订单 (${orders.length})`,
      children: (
        <Table
          columns={orderColumns}
          dataSource={orders}
          rowKey="id"
          loading={ordersLoading}
          pagination={false}
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/user/list')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 4 }}>
            用户详情
          </h1>
        </div>
      </div>

      {/* 用户信息卡片 */}
      <Card style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar
            src={getImageUrl(user.avatar)}
            icon={<UserOutlined />}
            size={80}
            style={{ backgroundColor: 'var(--color-primary)', marginRight: 24 }}
          />
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 8 }}>
              {user.nickname || '未设置昵称'}
            </h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <Tag color={user.is_member ? 'gold' : 'default'}>
                {user.is_member ? 'VIP会员' : '普通用户'}
              </Tag>
              <Tag color={user.status === 1 ? 'success' : 'error'}>
                {user.status === 1 ? '正常' : '已禁用'}
              </Tag>
            </div>
          </div>
        </div>

        <Descriptions column={3}>
          <Descriptions.Item label="手机号">{user.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="健康豆">{user.health_beans || 0}</Descriptions.Item>
          <Descriptions.Item label="优惠券">{user.coupons || 0}</Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {dayjs(user.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
            {dayjs(user.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 关联数据 */}
      <Card style={{ borderRadius: 'var(--radius-lg)' }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}

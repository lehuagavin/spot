/**
 * 订单详情页面
 */
import { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Spin,
  message,
  List,
  Avatar,
  Modal,
  Space,
} from 'antd';
import { ArrowLeftOutlined, RollbackOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrder, processRefund } from '../../api/orders';
import { getImageUrl } from '../../api/upload';
import type { Order } from '../../types';
import { OrderStatusText, OrderStatusColor } from '../../types';
import dayjs from 'dayjs';

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrder(id!);
      setOrder(data);
    } catch (error) {
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = () => {
    if (!order) return;
    Modal.confirm({
      title: '确认退款',
      content: `确定要为订单 ${order.order_no} 处理退款吗？退款金额: ¥${order.pay_amount.toFixed(2)}`,
      okText: '确认退款',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await processRefund(order.id, { reason: '管理员操作退款' });
          message.success('退款处理成功');
          fetchOrder();
        } catch (error) {
          message.error('退款处理失败');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <p>订单不存在</p>
        <Button onClick={() => navigate('/order/list')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/order/list')}
            style={{ marginRight: 16 }}
          >
            返回
          </Button>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 4 }}>
              订单详情
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>订单号: {order.order_no}</p>
          </div>
        </div>
        {['paid', 'enrolling'].includes(order.status) && (
          <Button danger icon={<RollbackOutlined />} onClick={handleRefund}>
            处理退款
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 订单信息 */}
        <Card
          title="订单信息"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <Descriptions column={1}>
            <Descriptions.Item label="订单号">{order.order_no}</Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={OrderStatusColor[order.status]}>{OrderStatusText[order.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单金额">
              ¥{order.total_amount.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="优惠金额">
              ¥{order.discount_amount.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="实付金额">
              <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 18 }}>
                ¥{order.pay_amount.toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {dayjs(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {order.pay_time && (
              <Descriptions.Item label="支付时间">
                {dayjs(order.pay_time).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {order.refund_time && (
              <Descriptions.Item label="退款时间">
                {dayjs(order.refund_time).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {order.refund_reason && (
              <Descriptions.Item label="退款原因">{order.refund_reason}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 用户信息 */}
        <Card
          title="用户信息"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <Descriptions column={1}>
            <Descriptions.Item label="用户昵称">
              {order.user?.nickname || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">{order.user?.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="是否会员">
              <Tag color={order.user?.is_member ? 'gold' : 'default'}>
                {order.user?.is_member ? 'VIP会员' : '普通用户'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 课程信息 */}
        <Card
          title="课程信息"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <Descriptions column={1}>
            <Descriptions.Item label="课程名称">{order.course?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="适合年龄">{order.course?.age_range || '-'}</Descriptions.Item>
            <Descriptions.Item label="所属小区">
              {order.course?.community?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="授课教练">
              {order.course?.teacher?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="上课时间">{order.course?.schedule || '-'}</Descriptions.Item>
            <Descriptions.Item label="上课地点">{order.course?.location || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 学员信息 */}
        <Card
          title={`报名学员 (${order.students?.length || 0}人)`}
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <List
            dataSource={order.students || []}
            locale={{ emptyText: '暂无学员信息' }}
            renderItem={(student) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={getImageUrl(student.photo)}
                      icon={<UserOutlined />}
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  }
                  title={student.id_name}
                  description={
                    <Space>
                      <span>{student.gender === 'male' ? '男' : '女'}</span>
                      <span>{dayjs(student.birthday).format('YYYY-MM-DD')}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

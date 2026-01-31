/**
 * 订单列表页面
 */
import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Select, DatePicker, message, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getOrders, processRefund } from '../../api/orders';
import type { Order, OrderStatus, PageParams } from '../../types';
import { OrderStatusText, OrderStatusColor } from '../../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function OrderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<
    PageParams & {
      keyword?: string;
      status?: OrderStatus;
      start_date?: string;
      end_date?: string;
    }
  >({
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOrders(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, page: 1, keyword: value });
  };

  const handleStatusFilter = (value: OrderStatus | undefined) => {
    setParams({ ...params, page: 1, status: value });
  };

  const handleDateRangeChange = (dates: unknown) => {
    if (dates && Array.isArray(dates) && dates.length === 2) {
      setParams({
        ...params,
        page: 1,
        start_date: dates[0]?.format('YYYY-MM-DD'),
        end_date: dates[1]?.format('YYYY-MM-DD'),
      });
    } else {
      setParams({
        ...params,
        page: 1,
        start_date: undefined,
        end_date: undefined,
      });
    }
  };

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setParams({
      ...params,
      page: pagination.current || 1,
      page_size: pagination.pageSize || 10,
    });
  };

  const handleRefund = (record: Order) => {
    Modal.confirm({
      title: '确认退款',
      content: `确定要为订单 ${record.order_no} 处理退款吗？退款金额: ¥${Number(record.pay_amount).toFixed(2)}`,
      okText: '确认退款',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await processRefund(record.id, { reason: '管理员操作退款' });
          message.success('退款处理成功');
          fetchData();
        } catch (error) {
          message.error('退款处理失败');
        }
      },
    });
  };

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      render: (text: string, record: Order) => (
        <a onClick={() => navigate(`/order/detail/${record.id}`)} style={{ fontWeight: 500 }}>
          {text}
        </a>
      ),
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>{record.user?.nickname || '-'}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
            {record.user?.phone || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '课程',
      key: 'course',
      render: (_, record) => (
        <div>
          <div>{record.course?.name || '-'}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
            {record.course?.community?.name || '-'}
          </div>
        </div>
      ),
    },
    {
      title: '学员数',
      dataIndex: 'student_ids',
      key: 'student_ids',
      render: (ids: string[]) => `${ids?.length || 0} 人`,
    },
    {
      title: '订单金额',
      key: 'amount',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>¥{Number(record.pay_amount).toFixed(2)}</div>
          {Number(record.discount_amount) > 0 && (
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
              优惠: ¥{Number(record.discount_amount).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={OrderStatusColor[status]}>{OrderStatusText[status]}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/order/detail/${record.id}`)}
          >
            详情
          </Button>
          {['paid', 'enrolling'].includes(record.status) && (
            <Button
              type="link"
              size="small"
              danger
              icon={<RollbackOutlined />}
              onClick={() => handleRefund(record)}
            >
              退款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 4 }}>
          订单管理
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>管理用户订单信息</p>
      </div>

      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Input.Search
          placeholder="搜索订单号/用户"
          allowClear
          onSearch={handleSearch}
          style={{ width: 250 }}
          prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
        />
        <Select
          placeholder="订单状态"
          allowClear
          style={{ width: 120 }}
          onChange={handleStatusFilter}
          options={Object.entries(OrderStatusText).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <RangePicker onChange={handleDateRangeChange} placeholder={['开始日期', '结束日期']} />
      </div>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.page_size,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}

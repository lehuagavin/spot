/**
 * 用户列表页面
 */
import { useEffect, useState } from 'react';
import { Table, Button, Input, Tag, Switch, message, Avatar, Select } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUserStatus } from '../../api/users';
import { getImageUrl } from '../../api/upload';
import type { User, PageParams } from '../../types';
import dayjs from 'dayjs';

export default function UserList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<
    PageParams & {
      keyword?: string;
      status?: number;
      is_member?: boolean;
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
      const res = await getUsers(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, page: 1, keyword: value });
  };

  const handleMemberFilter = (value: boolean | undefined) => {
    setParams({ ...params, page: 1, is_member: value });
  };

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setParams({
      ...params,
      page: pagination.current || 1,
      page_size: pagination.pageSize || 10,
    });
  };

  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      await updateUserStatus(id, checked ? 1 : 0);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={getImageUrl(record.avatar)}
            icon={<UserOutlined />}
            size={40}
            style={{ backgroundColor: 'var(--color-primary)', marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.nickname || '未设置昵称'}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
              {record.phone || '未绑定手机'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '会员状态',
      dataIndex: 'is_member',
      key: 'is_member',
      render: (is_member: boolean) => (
        <Tag color={is_member ? 'gold' : 'default'}>{is_member ? 'VIP会员' : '普通用户'}</Tag>
      ),
    },
    {
      title: '健康豆',
      dataIndex: 'health_beans',
      key: 'health_beans',
      render: (value: number) => value || 0,
    },
    {
      title: '优惠券',
      dataIndex: 'coupons',
      key: 'coupons',
      render: (value: number) => value || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: User) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/user/detail/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 4 }}>
          用户管理
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>管理平台用户信息</p>
      </div>

      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Input.Search
          placeholder="搜索用户昵称/手机号"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
        />
        <Select
          placeholder="会员状态"
          allowClear
          style={{ width: 120 }}
          onChange={handleMemberFilter}
          options={[
            { value: true, label: 'VIP会员' },
            { value: false, label: '普通用户' },
          ]}
        />
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

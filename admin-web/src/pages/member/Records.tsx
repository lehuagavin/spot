/**
 * 会员购买记录页面
 */
import { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getMemberRecords } from '../../api/members';
import type { UserMember, PageParams } from '../../types';
import DefaultAvatar from '../../components/DefaultAvatar';
import { MemberCardTypeText } from '../../types';
import dayjs from 'dayjs';

export default function MemberRecords() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserMember[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<PageParams>({
    page: 1,
    page_size: 10,
  });

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMemberRecords(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取购买记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setParams({
      ...params,
      page: pagination.current || 1,
      page_size: pagination.pageSize || 10,
    });
  };

  const columns: ColumnsType<UserMember> = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DefaultAvatar
            src={record.user?.avatar}
            name={record.user?.nickname}
            type="member"
            size={36}
            style={{ marginRight: 10 }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user?.nickname || '未设置昵称'}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
              {record.user?.phone || '-'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '权益卡',
      key: 'member_card',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.member_card?.name || '-'}</div>
          <Tag color="blue" style={{ marginTop: 4 }}>
            {record.member_card?.type ? MemberCardTypeText[record.member_card.type] : '-'}
          </Tag>
        </div>
      ),
    },
    {
      title: '有效期',
      key: 'validity',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.start_date).format('YYYY-MM-DD')}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            至 {dayjs(record.end_date).format('YYYY-MM-DD')}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: UserMember) => {
        const isExpired = dayjs(record.end_date).isBefore(dayjs());
        if (isExpired) {
          return <Tag color="default">已过期</Tag>;
        }
        return status === 1 ? (
          <Tag color="success">生效中</Tag>
        ) : (
          <Tag color="default">已失效</Tag>
        );
      },
    },
    {
      title: '购买时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div className="fade-in">
      {/* 页面标题与装饰区域 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%), url(/images/member-vip.png)',
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 32px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 4,
            }}
          >
            购买记录
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            查看会员权益卡购买记录
          </p>
        </div>
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

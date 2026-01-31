/**
 * 权益卡管理页面
 */
import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getMemberCards,
  createMemberCard,
  updateMemberCard,
} from '../../api/members';
import type { MemberCard, MemberCardCreateRequest, MemberCardType, PageParams } from '../../types';
import { MemberCardTypeText } from '../../types';
import EmptyState from '../../components/EmptyState';
import dayjs from 'dayjs';

export default function MemberCards() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MemberCard[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<PageParams>({
    page: 1,
    page_size: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MemberCard | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMemberCards();
      // 后端返回数组格式，直接使用
      setData(Array.isArray(res) ? res : []);
      setTotal(Array.isArray(res) ? res.length : 0);
    } catch (error) {
      message.error('获取权益卡列表失败');
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

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: MemberCard) => {
    setEditingRecord(record);
    // 转换字段格式
    const formValues: Record<string, unknown> = { ...record };
    
    // 将 duration 映射到 duration_days（表单字段名）
    formValues.duration_days = record.duration;
    
    // 将 benefits 数组转换为文本显示（每行一条）
    if (Array.isArray(record.benefits)) {
      formValues.benefits = record.benefits.join('\n');
    } else if (record.benefits && typeof record.benefits === 'object' && 'items' in record.benefits) {
      formValues.benefits = (record.benefits as { items: string[] }).items.join('\n');
    }
    
    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleStatusChange = async (record: MemberCard, checked: boolean) => {
    try {
      await updateMemberCard(record.id, { status: checked ? 1 : 0 });
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      
      // 将 benefits 文本转换为数组（按行分割，过滤空行）
      if (values.benefits && typeof values.benefits === 'string') {
        const benefitsArray = values.benefits
          .split('\n')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0);
        values.benefits = benefitsArray.length > 0 ? benefitsArray : undefined;
      }
      
      if (editingRecord) {
        await updateMemberCard(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createMemberCard(values as MemberCardCreateRequest);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<MemberCard> = [
    {
      title: '权益卡名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: MemberCardType) => (
        type ? <Tag color="blue">{MemberCardTypeText[type] || type}</Tag> : '-'
      ),
    },
    {
      title: '价格',
      key: 'price',
      render: (_, record) => (
        <div>
          <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            ¥{record.price}
          </div>
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 12,
              textDecoration: 'line-through',
            }}
          >
            ¥{record.original_price}
          </div>
        </div>
      ),
    },
    {
      title: '有效期',
      dataIndex: 'duration',
      key: 'duration',
      render: (days: number) => `${days} 天`,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: MemberCard) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
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
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
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
            权益卡管理
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            管理会员权益卡配置
          </p>
        </div>
      </div>

      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增权益卡
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: <EmptyState description="暂无权益卡数据" imageSize={120} /> }}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑权益卡' : '新增权益卡'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="权益卡名称"
            rules={[{ required: true, message: '请输入权益卡名称' }]}
          >
            <Input placeholder="如: 季卡" />
          </Form.Item>
          <Form.Item
            name="type"
            label="卡类型"
            rules={[{ required: true, message: '请选择卡类型' }]}
          >
            <Select
              placeholder="请选择"
              options={Object.entries(MemberCardTypeText).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="price"
              label="售价"
              rules={[{ required: true, message: '请输入售价' }]}
            >
              <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="original_price"
              label="原价"
              rules={[{ required: true, message: '请输入原价' }]}
            >
              <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="duration_days"
              label="有效期(天)"
              rules={[{ required: true, message: '请输入有效期' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="sort_order"
              label="排序"
              initialValue={0}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入权益卡描述" rows={2} />
          </Form.Item>
          <Form.Item name="benefits" label="权益说明">
            <Input.TextArea placeholder="请输入权益说明，一行一条" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

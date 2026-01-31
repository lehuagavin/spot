/**
 * 小区列表页面
 */
import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Image,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} from '../../api/communities';
import { getImageUrl } from '../../api/upload';
import type { Community, CommunityCreateRequest, PageParams } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import dayjs from 'dayjs';

export default function CommunityList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Community[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<PageParams & { keyword?: string }>({
    page: 1,
    page_size: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Community | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCommunities(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取小区列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, page: 1, keyword: value });
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

  const handleEdit = (record: Community) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCommunity(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);
      if (editingRecord) {
        await updateCommunity(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createCommunity(values as CommunityCreateRequest);
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

  const columns: ColumnsType<Community> = [
    {
      title: '小区图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => (
        <Image
          src={getImageUrl(image)}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Kc"
        />
      ),
    },
    {
      title: '小区名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '经纬度',
      key: 'location',
      render: (_, record) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个小区吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 4 }}>
          小区管理
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>管理可服务的小区信息</p>
      </div>

      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Input.Search
          placeholder="搜索小区名称或地址"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增小区
        </Button>
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? '编辑小区' : '新增小区'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label="小区名称"
            rules={[{ required: true, message: '请输入小区名称' }]}
          >
            <Input placeholder="请输入小区名称" />
          </Form.Item>
          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea placeholder="请输入详细地址" rows={2} />
          </Form.Item>
          <Form.Item name="image" label="小区图片">
            <ImageUpload />
          </Form.Item>
          <Space size={16}>
            <Form.Item
              name="latitude"
              label="纬度"
              rules={[{ required: true, message: '请输入纬度' }]}
            >
              <InputNumber
                placeholder="如: 20.0"
                style={{ width: 200 }}
                min={-90}
                max={90}
                precision={6}
              />
            </Form.Item>
            <Form.Item
              name="longitude"
              label="经度"
              rules={[{ required: true, message: '请输入经度' }]}
            >
              <InputNumber
                placeholder="如: 110.0"
                style={{ width: 200 }}
                min={-180}
                max={180}
                precision={6}
              />
            </Form.Item>
          </Space>
          {editingRecord && (
            <Form.Item name="status" label="状态" initialValue={1}>
              <Input type="hidden" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

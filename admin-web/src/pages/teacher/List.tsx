/**
 * 教练列表页面
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
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../../api/teachers';
import type { Teacher, TeacherCreateRequest, PageParams } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import DefaultAvatar from '../../components/DefaultAvatar';
import EmptyState from '../../components/EmptyState';
import dayjs from 'dayjs';

export default function TeacherList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<PageParams & { keyword?: string }>({
    page: 1,
    page_size: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Teacher | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTeachers(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取教练列表失败');
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

  const handleEdit = (record: Teacher) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeacher(id);
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
        await updateTeacher(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createTeacher(values as TeacherCreateRequest);
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

  const columns: ColumnsType<Teacher> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string, record: Teacher) => (
        <DefaultAvatar
          src={avatar}
          name={record.name}
          type="teacher"
          size={48}
        />
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '简介',
      dataIndex: 'introduction',
      key: 'introduction',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '在职' : '离职'}
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
            title="确定要删除这个教练吗？"
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
      {/* 页面标题与装饰区域 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%), url(/images/teacher-coach.png)',
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
            教练管理
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            管理平台教练信息
          </p>
        </div>
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
          placeholder="搜索教练姓名或手机号"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增教练
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: <EmptyState description="暂无教练数据" imageSize={120} /> }}
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
        title={editingRecord ? '编辑教练' : '新增教练'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="avatar" label="头像">
            <ImageUpload />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入教练姓名' }]}
          >
            <Input placeholder="请输入教练姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="introduction" label="简介">
            <Input.TextArea placeholder="请输入教练简介" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

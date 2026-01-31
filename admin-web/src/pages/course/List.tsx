/**
 * 课程列表页面
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
  Select,
  DatePicker,
  message,
  Drawer,
  Descriptions,
  Avatar,
  List,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getCourses,
  createCourse,
  updateCourse,
  getCourseStudents,
} from '../../api/courses';
import { getAllCommunities } from '../../api/communities';
import { getAllTeachers } from '../../api/teachers';
import { getImageUrl } from '../../api/upload';
import type {
  Course,
  CourseCreateRequest,
  CourseStatus,
  Community,
  Teacher,
  Student,
  PageParams,
} from '../../types';
import { CourseStatusText, CourseStatusColor } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import dayjs from 'dayjs';

export default function CourseList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<PageParams & { keyword?: string; status?: CourseStatus }>({
    page: 1,
    page_size: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Course | null>(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  // 下拉选项
  const [communities, setCommunities] = useState<Community[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // 学员抽屉
  const [studentsDrawerVisible, setStudentsDrawerVisible] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCourses(params);
      setData(res.list);
      setTotal(res.total);
    } catch (error) {
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [communitiesData, teachersData] = await Promise.all([
        getAllCommunities(),
        getAllTeachers(),
      ]);
      setCommunities(communitiesData || []);
      setTeachers(teachersData || []);
    } catch (error) {
      console.error('获取选项数据失败:', error);
      setCommunities([]);
      setTeachers([]);
    }
  };

  const handleSearch = (value: string) => {
    setParams({ ...params, page: 1, keyword: value });
  };

  const handleStatusFilter = (value: CourseStatus | undefined) => {
    setParams({ ...params, page: 1, status: value });
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

  const handleEdit = (record: Course) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      deadline: dayjs(record.deadline),
      start_date: dayjs(record.start_date),
    });
    setModalVisible(true);
  };

  const handleViewStudents = async (record: Course) => {
    setCurrentCourse(record);
    setStudentsDrawerVisible(true);
    setStudentsLoading(true);
    try {
      const students = await getCourseStudents(record.id);
      setCourseStudents(students);
    } catch (error) {
      message.error('获取学员列表失败');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        deadline: values.deadline.format('YYYY-MM-DD HH:mm:ss'),
        start_date: values.start_date.format('YYYY-MM-DD'),
      };
      setSubmitLoading(true);
      if (editingRecord) {
        await updateCourse(editingRecord.id, submitData);
        message.success('更新成功');
      } else {
        await createCourse(submitData as CourseCreateRequest);
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

  const columns: ColumnsType<Course> = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Course) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.image && (
            <img
              src={getImageUrl(record.image)}
              alt={text}
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                marginRight: 12,
                objectFit: 'cover',
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
              {record.age_range}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '小区',
      dataIndex: 'community_name',
      key: 'community_name',
      render: (_: unknown, record: Course) => record.community?.name || record.community_name || '-',
    },
    {
      title: '教练',
      dataIndex: 'teacher_name',
      key: 'teacher_name',
      render: (_: unknown, record: Course) => record.teacher?.name || record.teacher_name || '-',
    },
    {
      title: '价格',
      key: 'price',
      render: (_, record) => (
        <div>
          <div>¥{record.price}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
            会员价: ¥{record.member_price}
          </div>
        </div>
      ),
    },
    {
      title: '报名人数',
      key: 'students',
      render: (_, record) => (
        <span>
          {record.current_students}/{record.max_students}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: CourseStatus) => (
        <Tag color={CourseStatusColor[status]}>{CourseStatusText[status]}</Tag>
      ),
    },
    {
      title: '报名截止',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          <Button
            type="link"
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleViewStudents(record)}
          >
            学员
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600, marginBottom: 4 }}>
          课程管理
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>管理拼班课程信息</p>
      </div>

      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Space>
          <Input.Search
            placeholder="搜索课程名称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
          />
          <Select
            placeholder="课程状态"
            allowClear
            style={{ width: 120 }}
            onChange={handleStatusFilter}
            options={Object.entries(CourseStatusText).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增课程
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
        title={editingRecord ? '编辑课程' : '新增课程'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="课程名称"
              rules={[{ required: true, message: '请输入课程名称' }]}
            >
              <Input placeholder="如: 体能+跳绳" />
            </Form.Item>
            <Form.Item
              name="age_range"
              label="适合年龄"
              rules={[{ required: true, message: '请输入适合年龄' }]}
            >
              <Input placeholder="如: 7-12岁" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="community_id"
              label="所属小区"
              rules={[{ required: true, message: '请选择小区' }]}
            >
              <Select
                placeholder="请选择小区"
                options={(communities || []).map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
            <Form.Item
              name="teacher_id"
              label="授课教练"
              rules={[{ required: true, message: '请选择教练' }]}
            >
              <Select
                placeholder="请选择教练"
                options={(teachers || []).map((t) => ({ value: t.id, label: t.name }))}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="location"
            label="上课地点"
            rules={[{ required: true, message: '请输入上课地点' }]}
          >
            <Input placeholder="请输入详细上课地点" />
          </Form.Item>
          <Form.Item
            name="schedule"
            label="上课时间"
            rules={[{ required: true, message: '请输入上课时间' }]}
          >
            <Input placeholder="如: 周六 08:00-09:00" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="total_weeks"
              label="总周数"
              rules={[{ required: true, message: '请输入' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="total_lessons"
              label="总课时"
              rules={[{ required: true, message: '请输入' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="min_students"
              label="最低成班人数"
              rules={[{ required: true, message: '请输入' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="max_students"
              label="最大班级人数"
              rules={[{ required: true, message: '请输入' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="price"
              label="课程单价"
              rules={[{ required: true, message: '请输入价格' }]}
            >
              <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="member_price"
              label="会员价"
              rules={[{ required: true, message: '请输入会员价' }]}
            >
              <InputNumber min={0} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="deadline"
              label="报名截止时间"
              rules={[{ required: true, message: '请选择' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="start_date"
              label="开课日期"
              rules={[{ required: true, message: '请选择' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="image" label="课程图片">
            <ImageUpload />
          </Form.Item>
          <Form.Item name="description" label="课程描述">
            <Input.TextArea placeholder="请输入课程描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 学员抽屉 */}
      <Drawer
        title={`${currentCourse?.name || ''} - 报名学员`}
        open={studentsDrawerVisible}
        onClose={() => setStudentsDrawerVisible(false)}
        width={500}
      >
        <Descriptions column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="报名人数">
            {currentCourse?.current_students}/{currentCourse?.max_students}
          </Descriptions.Item>
          <Descriptions.Item label="上课时间">{currentCourse?.schedule}</Descriptions.Item>
          <Descriptions.Item label="上课地点">{currentCourse?.location}</Descriptions.Item>
        </Descriptions>

        <List
          loading={studentsLoading}
          dataSource={courseStudents}
          locale={{ emptyText: '暂无报名学员' }}
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
      </Drawer>
    </div>
  );
}

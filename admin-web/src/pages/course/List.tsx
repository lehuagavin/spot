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
  Radio,
  Spin,
  Image,
  TimePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  TeamOutlined,
  UserOutlined,
  RobotOutlined,
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
import { getImageUrl, generateAIImage, generateDescription } from '../../api/upload';
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
import EmptyState from '../../components/EmptyState';
import { STYLE_PRESETS } from '../../constants/aiStyles';
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

  // AI 图片生成相关状态
  const [imageMode, setImageMode] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSize, setAiSize] = useState('2K');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // 上课时间相关状态
  const [scheduleWeekday, setScheduleWeekday] = useState<string>();
  const [scheduleTime, setScheduleTime] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // 适合年龄相关状态
  const [ageMin, setAgeMin] = useState<number>();
  const [ageMax, setAgeMax] = useState<number>();

  // AI 描述生成相关状态
  const [descMode, setDescMode] = useState<'manual' | 'auto'>('manual');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_PRESETS[0].value);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  // 存储每个记录的 AI 描述（key: recordId 或 'new'）
  const [aiPromptMap, setAiPromptMap] = useState<Record<string, string>>({});

  // 监听课程名称字段变化
  const watchedName = Form.useWatch('name', form);

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
      setData(res.items);
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
    // 重置 AI 生成相关状态
    setImageMode('upload');
    setAiPrompt(aiPromptMap['new'] || ''); // 恢复新增时的描述
    setGeneratedImageUrl(null);
    // 重置上课时间和年龄
    setScheduleWeekday(undefined);
    setScheduleTime(null);
    setAgeMin(undefined);
    setAgeMax(undefined);
    // 重置描述生成状态
    setDescMode('manual');
    setSelectedStyle(STYLE_PRESETS[0].value);
    setModalVisible(true);
  };

  const handleEdit = (record: Course) => {
    setEditingRecord(record);

    // 编辑时默认使用上传模式
    setImageMode('upload');
    setGeneratedImageUrl(null);
    // 恢复该记录的 AI 描述
    setAiPrompt(aiPromptMap[record.id] || '');
    setDescMode('manual');
    setSelectedStyle(STYLE_PRESETS[0].value);

    // 解析上课时间 - 优先使用 schedule 字段，否则从分开字段组合
    let scheduleValue = record.schedule;
    if (record.schedule) {
      const scheduleMatch = record.schedule.match(/^(周[一二三四五六日])\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (scheduleMatch) {
        setScheduleWeekday(scheduleMatch[1]);
        setScheduleTime([
          dayjs(scheduleMatch[2], 'HH:mm') as dayjs.Dayjs,
          dayjs(scheduleMatch[3], 'HH:mm') as dayjs.Dayjs,
        ]);
      } else {
        setScheduleWeekday(undefined);
        setScheduleTime(null);
      }
    } else if (record.schedule_day && record.schedule_start && record.schedule_end) {
      // 从分开字段组合
      const startStr = typeof record.schedule_start === 'string' 
        ? record.schedule_start.substring(0, 5) 
        : String(record.schedule_start);
      const endStr = typeof record.schedule_end === 'string' 
        ? record.schedule_end.substring(0, 5) 
        : String(record.schedule_end);
      scheduleValue = `${record.schedule_day} ${startStr}-${endStr}`;
      setScheduleWeekday(record.schedule_day);
      setScheduleTime([
        dayjs(startStr, 'HH:mm') as dayjs.Dayjs,
        dayjs(endStr, 'HH:mm') as dayjs.Dayjs,
      ]);
    } else {
      setScheduleWeekday(undefined);
      setScheduleTime(null);
    }

    // 解析适合年龄 - 优先使用 age_range 字段，否则从 age_min/age_max 组合
    let ageRangeValue = record.age_range;
    if (record.age_range) {
      const ageMatch = record.age_range.match(/^(\d+)-(\d+)/);
      if (ageMatch) {
        setAgeMin(parseInt(ageMatch[1]));
        setAgeMax(parseInt(ageMatch[2]));
      } else {
        setAgeMin(undefined);
        setAgeMax(undefined);
      }
    } else if (record.age_min !== undefined && record.age_max !== undefined) {
      // 从分开字段组合
      ageRangeValue = `${record.age_min}-${record.age_max}岁`;
      setAgeMin(record.age_min);
      setAgeMax(record.age_max);
    } else {
      setAgeMin(undefined);
      setAgeMax(undefined);
    }

    // 设置表单值，确保包含 schedule 和 age_range
    form.setFieldsValue({
      ...record,
      deadline: dayjs(record.deadline),
      start_date: dayjs(record.start_date),
      schedule: scheduleValue,
      age_range: ageRangeValue,
    });

    setModalVisible(true);
  };

  // AI 生成描述
  const handleGenerateDescription = async () => {
    if (!selectedStyle) {
      message.warning('请先选择一种艺术风格');
      return;
    }

    if (!watchedName?.trim()) {
      message.warning('请先填写课程名称');
      return;
    }

    const values = form.getFieldsValue();

    // 提取上下文数据
    let location = values.location;
    if (values.location && scheduleWeekday && scheduleTime && scheduleTime[0] && scheduleTime[1]) {
      const timeStr = `${scheduleTime[0].format('HH:mm')}-${scheduleTime[1].format('HH:mm')}`;
      location = `${values.location}（${scheduleWeekday} ${timeStr}）`;
    }

    const age_range = ageMin && ageMax ? `${ageMin}-${ageMax}岁` : undefined;
    const community_name = communities.find(c => c.id === values.community_id)?.name;

    setGeneratingDesc(true);
    try {
      const result = await generateDescription({
        style: selectedStyle as any,
        context_type: 'course',
        context_data: {
          name: values.name,
          age_range,
          community_name,
          location: location || '社区运动场',
          total_weeks: values.total_weeks,
          total_lessons: values.total_lessons,
          min_students: values.min_students,
          max_students: values.max_students,
        },
      });

      setAiPrompt(result.description);
      // 保存到 Map 中
      const recordKey = editingRecord?.id || 'new';
      setAiPromptMap(prev => ({ ...prev, [recordKey]: result.description }));
      message.success('描述生成成功，您可以继续编辑');
    } catch (error: any) {
      if (error.response?.data?.detail?.code === 'API_KEY_MISSING') {
        message.error('系统未配置AI描述生成功能，请联系管理员');
      } else if (error.response?.data?.detail?.code === 'QUOTA_EXCEEDED') {
        message.error('AI服务配额已用完，请稍后重试或手动输入');
      } else {
        message.error('描述生成失败，请手动输入');
      }
    } finally {
      setGeneratingDesc(false);
    }
  };

  // AI 生成图片
  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      message.warning('请输入图片描述');
      return;
    }

    setAiGenerating(true);
    try {
      const result = await generateAIImage({
        prompt: aiPrompt,
        size: aiSize,
      });
      setGeneratedImageUrl(result.url);
      // 自动填充到表单
      form.setFieldsValue({ image: result.url });
      message.success('图片生成成功');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('生成图片失败');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  // 使用生成的图片
  const handleUseGeneratedImage = () => {
    if (generatedImageUrl) {
      form.setFieldsValue({ image: generatedImageUrl });
      message.success('已应用生成的图片');
    }
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

      // 组合上课时间
      let schedule = values.schedule;
      if (scheduleWeekday && scheduleTime && scheduleTime[0] && scheduleTime[1]) {
        schedule = `${scheduleWeekday} ${scheduleTime[0].format('HH:mm')}-${scheduleTime[1].format('HH:mm')}`;
      }

      // 组合适合年龄
      let age_range = values.age_range;
      if (ageMin !== undefined && ageMax !== undefined) {
        age_range = `${ageMin}-${ageMax}岁`;
      }

      const submitData = {
        ...values,
        deadline: values.deadline.format('YYYY-MM-DD HH:mm:ss'),
        start_date: values.start_date.format('YYYY-MM-DD'),
        schedule,
        age_range,
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
      // 只清空生成的图片，保留描述在 Map 中
      setGeneratedImageUrl(null);
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
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, textDecoration: 'line-through' }}>
            原价: ¥{record.price}
          </div>
          <div style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
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
          {record.enrolled_count ?? record.current_students ?? 0}/{record.max_students}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: CourseStatus) => {
        if (!status || !CourseStatusText[status]) {
          return <Tag color="default">未知状态</Tag>;
        }
        return <Tag color={CourseStatusColor[status]}>{CourseStatusText[status]}</Tag>;
      },
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
      {/* 页面标题与装饰区域 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%), url(/images/course-learning.png)',
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
            课程管理
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            管理拼班课程信息
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
        locale={{ emptyText: <EmptyState description="暂无课程数据" imageSize={120} /> }}
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
        onCancel={() => {
          setModalVisible(false);
          // 关闭时只清空生成的图片，保留描述在 Map 中
          setGeneratedImageUrl(null);
        }}
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
              label="适合年龄"
              required
            >
              <Input.Group compact>
                <InputNumber
                  value={ageMin}
                  onChange={(val) => {
                    setAgeMin(val || undefined);
                    if (val !== null && val !== undefined && ageMax !== undefined) {
                      form.setFieldsValue({ age_range: `${val}-${ageMax}岁` });
                    }
                  }}
                  placeholder="最小"
                  min={1}
                  max={18}
                  style={{ width: '40%' }}
                />
                <Input
                  placeholder="至"
                  disabled
                  style={{
                    width: '20%',
                    borderLeft: 0,
                    borderRight: 0,
                    pointerEvents: 'none',
                    textAlign: 'center',
                  }}
                />
                <InputNumber
                  value={ageMax}
                  onChange={(val) => {
                    setAgeMax(val || undefined);
                    if (ageMin !== undefined && val !== null && val !== undefined) {
                      form.setFieldsValue({ age_range: `${ageMin}-${val}岁` });
                    }
                  }}
                  placeholder="最大"
                  min={1}
                  max={18}
                  style={{ width: '40%' }}
                />
              </Input.Group>
              {/* 隐藏字段存储最终值 */}
              <Form.Item
                name="age_range"
                noStyle
                rules={[{ required: true, message: '请选择适合年龄' }]}
              >
                <Input type="hidden" />
              </Form.Item>
              {/* 快捷选择 */}
              <div style={{ marginTop: 8 }}>
                <Space wrap size={[8, 8]}>
                  {[
                    { label: '3-6岁', min: 3, max: 6 },
                    { label: '7-9岁', min: 7, max: 9 },
                    { label: '10-12岁', min: 10, max: 12 },
                    { label: '7-12岁', min: 7, max: 12 },
                    { label: '13-15岁', min: 13, max: 15 },
                  ].map((item) => (
                    <Button
                      key={item.label}
                      size="small"
                      type={ageMin === item.min && ageMax === item.max ? 'primary' : 'default'}
                      onClick={() => {
                        setAgeMin(item.min);
                        setAgeMax(item.max);
                        form.setFieldsValue({ age_range: item.label });
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Space>
              </div>
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
            label="上课时间"
            required
          >
            <Space.Compact style={{ width: '100%' }}>
              <Select
                value={scheduleWeekday}
                onChange={(val) => {
                  setScheduleWeekday(val);
                  if (val && scheduleTime && scheduleTime[0] && scheduleTime[1]) {
                    form.setFieldsValue({
                      schedule: `${val} ${scheduleTime[0].format('HH:mm')}-${scheduleTime[1].format('HH:mm')}`,
                    });
                  }
                }}
                placeholder="选择星期"
                style={{ width: '30%' }}
                options={[
                  { value: '周一', label: '周一' },
                  { value: '周二', label: '周二' },
                  { value: '周三', label: '周三' },
                  { value: '周四', label: '周四' },
                  { value: '周五', label: '周五' },
                  { value: '周六', label: '周六' },
                  { value: '周日', label: '周日' },
                ]}
              />
              <TimePicker.RangePicker
                value={scheduleTime}
                onChange={(times) => {
                  setScheduleTime(times);
                  if (scheduleWeekday && times && times[0] && times[1]) {
                    form.setFieldsValue({
                      schedule: `${scheduleWeekday} ${times[0].format('HH:mm')}-${times[1].format('HH:mm')}`,
                    });
                  }
                }}
                format="HH:mm"
                placeholder={['开始时间', '结束时间']}
                style={{ width: '70%' }}
              />
            </Space.Compact>
            {/* 隐藏字段存储最终值 */}
            <Form.Item
              name="schedule"
              noStyle
              rules={[{ required: true, message: '请选择上课时间' }]}
            >
              <Input type="hidden" />
            </Form.Item>
            {/* 快捷选择 */}
            <div style={{ marginTop: 8 }}>
              <Space wrap size={[8, 8]}>
                {[
                  { label: '周六上午', weekday: '周六', start: '08:00', end: '09:00' },
                  { label: '周六下午', weekday: '周六', start: '14:00', end: '15:00' },
                  { label: '周日上午', weekday: '周日', start: '08:00', end: '09:00' },
                  { label: '周日下午', weekday: '周日', start: '14:00', end: '15:00' },
                ].map((item) => (
                  <Button
                    key={item.label}
                    size="small"
                    type={
                      scheduleWeekday === item.weekday &&
                      scheduleTime?.[0]?.format('HH:mm') === item.start &&
                      scheduleTime?.[1]?.format('HH:mm') === item.end
                        ? 'primary'
                        : 'default'
                    }
                    onClick={() => {
                      setScheduleWeekday(item.weekday);
                      setScheduleTime([dayjs(item.start, 'HH:mm'), dayjs(item.end, 'HH:mm')]);
                      form.setFieldsValue({
                        schedule: `${item.weekday} ${item.start}-${item.end}`,
                      });
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Space>
            </div>
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
          <Form.Item label="图片来源">
            <Radio.Group
              value={imageMode}
              onChange={(e) => setImageMode(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value="upload">上传图片</Radio.Button>
              <Radio.Button value="ai">
                <RobotOutlined /> AI 生成
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {imageMode === 'upload' ? (
            <Form.Item name="image" label="课程图片">
              <ImageUpload />
            </Form.Item>
          ) : (
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                marginBottom: 24,
              }}
            >
              {/* 第一行：描述生成方式 + 艺术风格选择 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <Form.Item label="描述生成方式" style={{ marginBottom: 0 }}>
                  <Radio.Group
                    value={descMode}
                    onChange={(e) => {
                      setDescMode(e.target.value);
                      // 切换到智能生成时，如果未选择风格则默认选择第一个
                      if (e.target.value === 'auto' && !selectedStyle) {
                        setSelectedStyle(STYLE_PRESETS[0].value);
                      }
                    }}
                  >
                    <Radio.Button value="manual">手动输入</Radio.Button>
                    <Radio.Button value="auto">
                      <RobotOutlined /> 智能生成
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {descMode === 'auto' && (
                  <Form.Item label="艺术风格" style={{ marginBottom: 0 }}>
                    <Select
                      value={selectedStyle}
                      onChange={setSelectedStyle}
                      placeholder="请选择艺术风格"
                      style={{ width: '100%' }}
                      optionLabelProp="label"
                    >
                      {STYLE_PRESETS.map((style) => (
                        <Select.Option key={style.value} value={style.value} label={style.label}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{style.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              {style.description}
                            </div>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </div>

              {/* 智能生成：生成描述按钮 */}
              {descMode === 'auto' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleGenerateDescription}
                    loading={generatingDesc}
                    disabled={!selectedStyle || !watchedName?.trim()}
                  >
                    {generatingDesc ? '生成中...' : '生成描述'}
                  </Button>
                  {!watchedName?.trim() && (
                    <span style={{ fontSize: 12, color: '#faad14' }}>
                      请先填写课程名称
                    </span>
                  )}
                  {watchedName?.trim() && !selectedStyle && (
                    <span style={{ fontSize: 12, color: '#faad14' }}>
                      请选择艺术风格
                    </span>
                  )}
                </div>
              )}

              {/* 图片描述 */}
              <Form.Item
                label="图片描述"
                required
                style={{ marginBottom: 16 }}
              >
                <Input.TextArea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="请输入图片描述，例如：一群孩子在运动场上进行体能训练，阳光明媚，充满活力"
                  rows={3}
                  maxLength={300}
                  showCount
                />
              </Form.Item>

              {/* 第三行：图片尺寸 + 生成图片按钮 */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                <Form.Item label="图片尺寸" style={{ marginBottom: 0, flex: 1 }}>
                  <Select
                    value={aiSize}
                    onChange={setAiSize}
                    options={[
                      { value: '2K', label: '2K（高清）' },
                      { value: '1080P', label: '1080P（标清宽屏）' },
                      { value: '720P', label: '720P（普清）' },
                      { value: '480P', label: '480P（快速预览）' },
                    ]}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleGenerateImage}
                  loading={aiGenerating}
                  disabled={!aiPrompt.trim()}
                >
                  {aiGenerating ? '生成中...' : '生成图片'}
                </Button>
              </div>

              {/* 生成结果预览 */}
              {(generatedImageUrl || aiGenerating) && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    生成结果
                  </div>
                  {aiGenerating ? (
                    <div
                      style={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Spin tip="AI 正在生成图片，请稍候..." />
                    </div>
                  ) : generatedImageUrl ? (
                    <div>
                      <Image
                        src={getImageUrl(generatedImageUrl)}
                        width={200}
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: 12,
                        }}
                      />
                      <div>
                        <Button
                          type="primary"
                          size="small"
                          onClick={handleUseGeneratedImage}
                        >
                          使用此图片
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 隐藏的表单项，用于存储图片 URL */}
              <Form.Item
                name="image"
                style={{ display: 'none' }}
              >
                <Input />
              </Form.Item>
            </div>
          )}
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
            {currentCourse?.enrolled_count ?? 0}/{currentCourse?.max_students}
          </Descriptions.Item>
          <Descriptions.Item label="上课时间">{currentCourse?.schedule}</Descriptions.Item>
          <Descriptions.Item label="上课地点">{currentCourse?.location}</Descriptions.Item>
        </Descriptions>

        <List
          loading={studentsLoading}
          dataSource={courseStudents}
          locale={{ emptyText: <EmptyState description="暂无报名学员" imageSize={100} /> }}
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

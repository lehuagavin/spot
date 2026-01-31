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
  Radio,
  Select,
  Spin,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
} from '../../api/communities';
import { getImageUrl, generateAIImage, generateDescription } from '../../api/upload';
import type { Community, CommunityCreateRequest, PageParams } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import EmptyState from '../../components/EmptyState';
import { STYLE_PRESETS } from '../../constants/aiStyles';
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

  // AI 图片生成相关状态
  const [imageMode, setImageMode] = useState<'upload' | 'ai'>('upload');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSize, setAiSize] = useState('2K');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // AI 描述生成相关状态
  const [descMode, setDescMode] = useState<'manual' | 'auto'>('manual');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_PRESETS[0].value);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  // 存储每个记录的 AI 描述（key: recordId 或 'new'）
  const [aiPromptMap, setAiPromptMap] = useState<Record<string, string>>({});

  // 监听小区名称字段变化
  const watchedName = Form.useWatch('name', form);

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
    // 重置 AI 生成相关状态
    setImageMode('upload');
    setAiPrompt(aiPromptMap['new'] || ''); // 恢复新增时的描述
    setGeneratedImageUrl(null);
    setDescMode('manual');
    setSelectedStyle(STYLE_PRESETS[0].value);
    setModalVisible(true);
  };

  const handleEdit = (record: Community) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    // 编辑时默认使用上传模式
    setImageMode('upload');
    setGeneratedImageUrl(null);
    // 恢复该记录的 AI 描述
    setAiPrompt(aiPromptMap[record.id] || '');
    setDescMode('manual');
    setSelectedStyle(STYLE_PRESETS[0].value);
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

  // AI 生成描述
  const handleGenerateDescription = async () => {
    if (!selectedStyle) {
      message.warning('请先选择一种艺术风格');
      return;
    }

    if (!watchedName?.trim()) {
      message.warning('请先填写小区名称');
      return;
    }

    const values = form.getFieldsValue();

    setGeneratingDesc(true);
    try {
      const result = await generateDescription({
        style: selectedStyle as any,
        context_type: 'banner',
        context_data: {
          title: `${values.name}小区` + (values.address ? ` - ${values.address}` : ''),
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
          {Number(record.latitude).toFixed(4)}, {Number(record.longitude).toFixed(4)}
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
      {/* 页面标题与装饰区域 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(3, 169, 244, 0.08) 100%)',
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
            小区管理
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            管理可服务的小区信息
          </p>
        </div>
        <img
          src="/images/community-home.png"
          alt="Community"
          style={{
            height: 100,
            objectFit: 'contain',
            opacity: 0.9,
          }}
        />
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
        locale={{ emptyText: <EmptyState description="暂无小区数据" imageSize={120} /> }}
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
            <Form.Item name="image" label="小区图片">
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
                      请先填写小区名称
                    </span>
                  )}
                  {watchedName?.trim() && !selectedStyle && (
                    <span style={{ fontSize: 12, color: '#faad14' }}>
                      请选择艺术风格
                    </span>
                  )}
                </div>
              )}

              <Form.Item
                label="图片描述"
                required
                help="描述小区场景、建筑风格、环境等特点，会影响生成的图片效果"
              >
                <Input.TextArea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="请输入图片描述，例如：现代化高层住宅小区，绿树成荫，配套设施完善"
                  rows={4}
                  disabled={descMode === 'auto' && generatingDesc}
                />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 16 }}>
                <Form.Item label="图片尺寸" style={{ marginBottom: 0 }}>
                  <Select value={aiSize} onChange={setAiSize}>
                    <Select.Option value="1K">1024x1024 (1K)</Select.Option>
                    <Select.Option value="2K">2048x2048 (2K)</Select.Option>
                  </Select>
                </Form.Item>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleGenerateImage}
                    loading={aiGenerating}
                    disabled={!aiPrompt.trim()}
                    block
                  >
                    {aiGenerating ? '生成中...' : '生成图片'}
                  </Button>
                </div>
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

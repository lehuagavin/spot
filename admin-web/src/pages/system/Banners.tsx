/**
 * 轮播图管理页面
 */
import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Popconfirm,
  Image,
  Radio,
  Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../api/banners';
import { getImageUrl, generateAIImage, generateDescription } from '../../api/upload';
import type { Banner, BannerCreateRequest, PageParams } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import EmptyState from '../../components/EmptyState';
import { STYLE_PRESETS } from '../../constants/aiStyles';
import dayjs from 'dayjs';

export default function Banners() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<PageParams>({
    page: 1,
    page_size: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Banner | null>(null);
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

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getBanners(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取轮播图列表失败');
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
    // 重置 AI 生成相关状态
    setImageMode('upload');
    setAiPrompt(aiPromptMap['new'] || ''); // 恢复新增时的描述
    setGeneratedImageUrl(null);
    setDescMode('manual');
    setSelectedStyle(STYLE_PRESETS[0].value);
    setModalVisible(true);
  };

  const handleEdit = (record: Banner) => {
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

  // AI 生成描述
  const handleGenerateDescription = async () => {
    if (!selectedStyle) {
      message.warning('请先选择一种艺术风格');
      return;
    }

    const title = form.getFieldValue('title');
    if (!title || !title.trim()) {
      message.warning('请先填写标题');
      return;
    }

    setGeneratingDesc(true);
    try {
      const result = await generateDescription({
        style: selectedStyle as any,
        context_type: 'banner',
        context_data: {
          title: title.trim(),
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

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (record: Banner, checked: boolean) => {
    try {
      await updateBanner(record.id, { status: checked ? 1 : 0 });
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
      if (editingRecord) {
        await updateBanner(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createBanner(values as BannerCreateRequest);
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

  const columns: ColumnsType<Banner> = [
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 200,
      render: (image: string) => (
        <Image
          src={getImageUrl(image)}
          width={160}
          height={80}
          style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Kc"
        />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '链接类型',
      dataIndex: 'link_type',
      key: 'link_type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          none: '无链接',
          page: '小程序页面',
          webview: '网页',
          course: '课程详情',
        };
        return typeMap[type] || type;
      },
    },
    {
      title: '链接地址',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true,
      render: (link: string) => link || '-',
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
      render: (status: number, record: Banner) => (
        <Switch
          checked={status === 1}
          onChange={(checked) => handleStatusChange(record, checked)}
          checkedChildren="显示"
          unCheckedChildren="隐藏"
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
            title="确定要删除这个轮播图吗？"
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
          轮播图管理
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>管理首页轮播图配置</p>
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
          新增轮播图
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: <EmptyState description="暂无轮播图数据" imageSize={120} /> }}
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
        title={editingRecord ? '编辑轮播图' : '新增轮播图'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          // 关闭时只清空生成的图片，保留描述在 Map 中
          setGeneratedImageUrl(null);
        }}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入轮播图标题" />
          </Form.Item>
          <Form.Item label="图片来源" required>
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
            <Form.Item
              name="image"
              label="图片"
              rules={[{ required: true, message: '请上传图片' }]}
            >
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
                    disabled={!selectedStyle || !form.getFieldValue('title')}
                  >
                    {generatingDesc ? '生成中...' : '生成描述'}
                  </Button>
                  {!form.getFieldValue('title') && (
                    <span style={{ fontSize: 12, color: '#faad14' }}>
                      请先填写标题
                    </span>
                  )}
                  {form.getFieldValue('title') && !selectedStyle && (
                    <span style={{ fontSize: 12, color: '#faad14' }}>
                      请选择艺术风格
                    </span>
                  )}
                </div>
              )}

              <Form.Item
                label="图片描述"
                required
                style={{ marginBottom: 16 }}
              >
                <Input.TextArea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="请输入图片描述，例如：一个温馨的家庭运动场景，父母和孩子在户外草坪上一起做瑜伽"
                  rows={3}
                  maxLength={300}
                  showCount
                />
              </Form.Item>
              <Form.Item label="图片尺寸" style={{ marginBottom: 16 }}>
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
                style={{ marginBottom: 16 }}
              >
                {aiGenerating ? '生成中...' : '生成图片'}
              </Button>

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
                rules={[{ required: true, message: '请生成图片' }]}
                style={{ display: 'none' }}
              >
                <Input />
              </Form.Item>
            </div>
          )}
          <Form.Item
            name="link_type"
            label="链接类型"
            initialValue="none"
          >
            <Select
              options={[
                { value: 'none', label: '无链接' },
                { value: 'page', label: '小程序页面' },
                { value: 'webview', label: '网页' },
                { value: 'course', label: '课程详情' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="link"
            label="链接地址"
          >
            <Input placeholder="请输入链接地址" />
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="排序"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

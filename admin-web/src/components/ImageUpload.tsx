/**
 * 图片上传组件
 */
import { useState } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile, RcFile } from 'antd/es/upload';
import { getImageUrl } from '../api/upload';

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  maxSize?: number; // MB
}

export default function ImageUpload({ value, onChange, maxSize = 5 }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLtSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtSize) {
      message.error(`图片大小不能超过 ${maxSize}MB！`);
      return false;
    }
    return true;
  };

  const handleChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      const response = info.file.response;
      if (response?.code === 0 && response?.data?.url) {
        onChange?.(response.data.url);
      } else {
        message.error('上传失败');
      }
    }
    if (info.file.status === 'error') {
      setLoading(false);
      message.error('上传失败');
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, color: 'var(--color-text-secondary)' }}>上传图片</div>
    </div>
  );

  return (
    <Upload
      name="file"
      listType="picture-card"
      showUploadList={false}
      action={`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api/v1/upload/image`}
      headers={{
        Authorization: `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : ''}`,
      }}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {value ? (
        <img
          src={getImageUrl(value)}
          alt="uploaded"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        uploadButton
      )}
    </Upload>
  );
}

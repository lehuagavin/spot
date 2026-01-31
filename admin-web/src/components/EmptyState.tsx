/**
 * 自定义空状态组件 - Ghibli 风格插图
 */
import type { CSSProperties } from 'react';

interface EmptyStateProps {
  description?: string;
  style?: CSSProperties;
  imageSize?: number;
}

export default function EmptyState({
  description = '暂无数据',
  style,
  imageSize = 150,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        ...style,
      }}
    >
      <img
        src="/images/empty-data.png"
        alt="Empty"
        style={{
          width: imageSize,
          height: imageSize,
          objectFit: 'contain',
          marginBottom: 16,
          opacity: 0.85,
        }}
      />
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

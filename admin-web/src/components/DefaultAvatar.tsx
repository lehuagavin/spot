/**
 * 自定义默认头像组件
 * 支持多种类型的渐变背景和精致图标设计
 */
import React from 'react';
import { Avatar } from 'antd';
import { getImageUrl } from '../api/upload';

export type AvatarType = 'user' | 'teacher' | 'member';

interface DefaultAvatarProps {
  src?: string;
  name?: string;
  type?: AvatarType;
  size?: number;
  style?: React.CSSProperties;
}

// 不同类型的渐变颜色配置
const gradientConfig: Record<AvatarType, { gradient: string; iconColor: string }> = {
  user: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconColor: 'rgba(255, 255, 255, 0.95)',
  },
  teacher: {
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    iconColor: 'rgba(255, 255, 255, 0.95)',
  },
  member: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    iconColor: 'rgba(255, 255, 255, 0.95)',
  },
};

// 自定义 SVG 图标 - 更精致的人物设计
const PersonIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const iconSize = size * 0.55;
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 头部 - 圆形 */}
      <circle
        cx="12"
        cy="8"
        r="4"
        fill={color}
        opacity="0.95"
      />
      {/* 身体 - 更圆润的肩膀设计 */}
      <path
        d="M4 20C4 16.134 7.582 13 12 13C16.418 13 20 16.134 20 20"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
    </svg>
  );
};

// 教练图标 - 带哨子/运动元素
const CoachIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const iconSize = size * 0.55;
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 头部 */}
      <circle
        cx="12"
        cy="7"
        r="3.5"
        fill={color}
        opacity="0.95"
      />
      {/* 身体 */}
      <path
        d="M5 21C5 17 8 14 12 14C16 14 19 17 19 21"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* 星星徽章 */}
      <path
        d="M12 16L12.7 17.4L14.2 17.6L13.1 18.7L13.4 20.2L12 19.5L10.6 20.2L10.9 18.7L9.8 17.6L11.3 17.4L12 16Z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
};

// VIP会员图标 - 带皇冠元素
const VipIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const iconSize = size * 0.55;
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 皇冠 */}
      <path
        d="M4 10L7 7L12 10L17 7L20 10V14H4V10Z"
        fill={color}
        opacity="0.9"
      />
      {/* 皇冠底座 */}
      <rect
        x="5"
        y="14"
        width="14"
        height="2"
        rx="1"
        fill={color}
        opacity="0.95"
      />
      {/* 皇冠顶部圆点 */}
      <circle cx="7" cy="7" r="1.2" fill={color} opacity="0.9" />
      <circle cx="12" cy="10" r="1.2" fill={color} opacity="0.9" />
      <circle cx="17" cy="7" r="1.2" fill={color} opacity="0.9" />
      {/* 身体简化 */}
      <path
        d="M6 19C6 17.343 8.686 16 12 16C15.314 16 18 17.343 18 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
    </svg>
  );
};

// 获取名字首字母
const getInitials = (name?: string): string => {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  
  // 如果是中文，取第一个字
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return trimmed.charAt(0);
  }
  
  // 英文取首字母大写
  return trimmed.charAt(0).toUpperCase();
};

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  src,
  name,
  type = 'user',
  size = 40,
  style,
}) => {
  const imageUrl = getImageUrl(src);
  const config = gradientConfig[type];
  const initials = getInitials(name);

  // 如果有图片，直接显示图片
  if (imageUrl) {
    return (
      <Avatar
        src={imageUrl}
        size={size}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          ...style,
        }}
      />
    );
  }

  // 如果有名字，显示首字母
  if (initials) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: config.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.iconColor,
          fontSize: size * 0.45,
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          flexShrink: 0,
          ...style,
        }}
      >
        {initials}
      </div>
    );
  }

  // 显示默认图标
  const IconComponent = type === 'teacher' ? CoachIcon : type === 'member' ? VipIcon : PersonIcon;
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: config.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        flexShrink: 0,
        ...style,
      }}
    >
      <IconComponent color={config.iconColor} size={size} />
    </div>
  );
};

export default DefaultAvatar;

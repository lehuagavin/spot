/**
 * AI 描述生成风格配置
 */

export interface StylePreset {
  value: string;
  label: string;
  description: string;
  promptSuffix: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    value: 'ghibli',
    label: '吉卜力风格',
    description: '温暖治愈，柔和色彩，充满想象力',
    promptSuffix: '吉卜力工作室风格，水彩画质感，柔和的色彩过渡，温暖治愈的氛围'
  },
  {
    value: 'pixar',
    label: '皮克斯风格',
    description: '3D质感，圆润可爱，明亮色彩',
    promptSuffix: '皮克斯动画风格，3D渲染质感，圆润的角色设计，明亮温暖的配色'
  },
  {
    value: 'storybook',
    label: '童话绘本',
    description: '梦幻温馨，充满童趣，鲜艳可爱',
    promptSuffix: '童话绘本风格，梦幻温馨的画面，充满童趣的角色，鲜艳明快的色彩，富有故事性'
  },
  {
    value: 'watercolor',
    label: '水彩画',
    description: '清新透明，色彩流动，轻盈柔和',
    promptSuffix: '水彩画风格，透明的色彩层次，自然的水色晕染，清新柔和的画面，充满艺术感'
  },
  {
    value: 'flat-illustration',
    label: '扁平插画',
    description: '简洁明快，几何图形，现代时尚',
    promptSuffix: '扁平插画风格，简洁的几何造型，鲜明的色块对比，现代时尚的设计感'
  },
  {
    value: 'japanese-illustration',
    label: '日系插画',
    description: '清新唯美，柔和光影，细腻温暖',
    promptSuffix: '日系插画风格，清新唯美的画面，柔和的光影效果，细腻温暖的色调'
  },
  {
    value: 'cartoon-3d',
    label: '3D卡通',
    description: 'Q版可爱，立体圆润，活泼生动',
    promptSuffix: '3D卡通风格，Q版可爱的角色造型，立体圆润的建模，活泼生动的表现'
  },
  {
    value: 'comic',
    label: '漫画风格',
    description: '线条清晰，动感十足，表现力强',
    promptSuffix: '漫画风格，清晰的线条勾勒，动感的构图，夸张生动的表现力'
  },
  {
    value: 'impressionism',
    label: '印象派',
    description: '光影斑斓，色彩丰富，意境优雅',
    promptSuffix: '印象派风格，斑斓的光影效果，丰富的色彩变化，捕捉瞬间的意境美感'
  },
  {
    value: 'pop-art',
    label: '波普艺术',
    description: '鲜艳明快，大胆夸张，充满活力',
    promptSuffix: '波普艺术风格，鲜艳明快的配色，大胆的色块对比，充满活力和现代感'
  },
  {
    value: 'oil',
    label: '油画风格',
    description: '厚重笔触，古典优雅，丰富层次',
    promptSuffix: '油画风格，厚重的笔触质感，古典优雅的色调，丰富的明暗层次'
  },
  {
    value: 'chinese',
    label: '中国画',
    description: '水墨意境，留白艺术，淡雅清新',
    promptSuffix: '中国画风格，水墨渲染，注重留白与意境，淡雅清新的色彩'
  },
  {
    value: 'minimalism',
    label: '极简主义',
    description: '简约纯粹，留白丰富，焦点突出',
    promptSuffix: '极简主义风格，简约纯粹的构图，丰富的留白空间，突出主体焦点'
  },
  {
    value: 'cyberpunk',
    label: '赛博朋克',
    description: '霓虹科技，未来感强，炫酷动感',
    promptSuffix: '赛博朋克风格，霓虹色彩，科技感十足，未来城市氛围，炫酷动感'
  },
  {
    value: 'futurism',
    label: '未来主义',
    description: '科技感，几何线条，鲜明对比',
    promptSuffix: '未来主义风格，科技感十足，几何线条流畅，高饱和度色彩对比'
  },
];

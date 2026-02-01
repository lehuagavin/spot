#!/bin/bash

# 同步上传文件到服务器
# 用法: ./sync-uploads.sh [user@server] [remote_path]

set -e

SERVER=${1:-"user@your-server"}
REMOTE_PATH=${2:-"/path/to/spot"}

echo "🔄 同步上传文件到服务器..."
echo "   服务器: $SERVER"
echo "   路径: $REMOTE_PATH/backend/uploads/"
echo ""

# 检查本地 uploads 目录
if [ ! -d "backend/uploads" ]; then
    echo "❌ 错误: backend/uploads 目录不存在"
    exit 1
fi

# 显示要同步的内容
echo "📊 本地文件统计:"
du -sh backend/uploads/*
TOTAL_SIZE=$(du -sh backend/uploads | cut -f1)
echo "   总大小: $TOTAL_SIZE"
echo ""

# 确认是否继续
read -p "是否继续同步? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

# 使用 rsync 同步
echo ""
echo "📤 开始同步..."
rsync -avz --progress \
    --exclude='.gitkeep' \
    backend/uploads/ \
    ${SERVER}:${REMOTE_PATH}/backend/uploads/

echo ""
echo "✅ 同步完成！"
echo ""
echo "📝 下一步："
echo "   1. SSH 登录服务器: ssh $SERVER"
echo "   2. 检查文件: ls -lah ${REMOTE_PATH}/backend/uploads/"
echo "   3. 重启容器以挂载: cd ${REMOTE_PATH} && make restart SERVICE=backend"

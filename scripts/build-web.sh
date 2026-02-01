#!/bin/bash

set -e

PROJECT_ROOT="$(dirname "$0")/.."
cd "$PROJECT_ROOT"

echo "🏗️  开始本地构建前端..."

cd admin-web

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建生产版本
echo "🔨 构建生产版本..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败：dist 目录不存在"
    exit 1
fi

cd ..

# 生成版本号（时间戳）
VERSION=$(date +%Y%m%d-%H%M%S)
BUILD_DIR="builds/web/${VERSION}"

echo ""
echo "📦 创建构建归档..."
echo "   版本号: ${VERSION}"

# 创建归档目录
mkdir -p "${BUILD_DIR}"

# 复制构建产物到归档目录
cp -r admin-web/dist/* "${BUILD_DIR}/"

# 更新 latest 软链接
cd builds/web
rm -f latest
ln -s "${VERSION}" latest
cd ../..

echo "✅ 构建归档完成！"
echo ""
echo "📊 构建信息:"
echo "   版本号: ${VERSION}"
echo "   归档位置: ${BUILD_DIR}"
echo "   产物大小: $(du -sh "${BUILD_DIR}" | cut -f1)"

# 显示所有版本
echo ""
echo "📋 可用版本列表:"
ls -lt builds/web/ | grep -v 'total' | grep -v 'latest' | head -5 | while read -r line; do
    dir=$(echo "$line" | awk '{print $NF}')
    if [ -d "builds/web/$dir" ]; then
        size=$(du -sh "builds/web/$dir" | cut -f1)
        if [ "$dir" = "$(readlink builds/web/latest 2>/dev/null)" ]; then
            echo "   $dir (latest) ← $size"
        else
            echo "   $dir ← $size"
        fi
    fi
done

echo ""
echo "📝 下一步操作："
echo ""
echo "   1️⃣  部署最新版本:"
echo "      make deploy SERVICE=web"
echo ""
echo "   2️⃣  部署指定版本:"
echo "      BUILD_VERSION=${VERSION} make deploy SERVICE=web"
echo ""
echo "   3️⃣  查看所有版本:"
echo "      make list-builds"
echo ""
echo "   4️⃣  清理旧版本（保留最近10个）:"
echo "      make clean-builds KEEP=10"
echo ""

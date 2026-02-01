#!/bin/bash

# Docker Compose 快速部署脚本
# 用于快速启动 Spot 项目的所有服务

set -e

# 颜色定义
COLOR_RESET='\033[0m'
COLOR_BOLD='\033[1m'
COLOR_GREEN='\033[32m'
COLOR_YELLOW='\033[33m'
COLOR_BLUE='\033[34m'
COLOR_RED='\033[31m'

# 打印带颜色的消息
print_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $1"
}

print_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_RESET} $1"
}

print_warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${COLOR_RESET} $1"
}

print_error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $1"
}

print_header() {
    echo -e "${COLOR_BOLD}$1${COLOR_RESET}"
}

# 检查依赖
check_dependencies() {
    print_header ">>> 检查依赖..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    print_success "依赖检查通过"
}

# 创建环境变量文件
setup_env_file() {
    print_header ">>> 配置环境变量..."

    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            print_info "从 .env.docker 创建 .env 文件"
            cp .env.docker .env
            print_warning "请编辑 .env 文件，配置必要的环境变量（如数据库密码、API密钥等）"
            print_warning "特别注意：SECRET_KEY、MYSQL_ROOT_PASSWORD 等安全相关配置"
            read -p "是否现在编辑 .env 文件? [y/N] " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ${EDITOR:-vi} .env
            fi
        else
            print_error ".env.docker 模板文件不存在"
            exit 1
        fi
    else
        print_info ".env 文件已存在，跳过创建"
    fi
}

# 创建必要的目录
create_directories() {
    print_header ">>> 创建必要的目录..."

    mkdir -p backend/uploads backend/logs

    print_success "目录创建完成"
}

# 构建并启动服务
start_services() {
    print_header ">>> 构建并启动服务..."

    docker compose up -d --build

    print_success "服务启动完成"
}

# 等待服务健康
wait_for_services() {
    print_header ">>> 等待服务启动..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker compose ps | grep -q "healthy"; then
            print_success "服务已就绪"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    print_warning "等待超时，请手动检查服务状态: make status"
}

# 显示服务信息
show_services_info() {
    print_header ">>> 服务信息"

    echo ""
    docker compose ps
    echo ""

    print_header ">>> 访问地址"
    echo -e "  ${COLOR_GREEN}管理后台:${COLOR_RESET} http://localhost:3000"
    echo -e "  ${COLOR_GREEN}后端 API:${COLOR_RESET} http://localhost:8000"
    echo -e "  ${COLOR_GREEN}API 文档:${COLOR_RESET} http://localhost:8000/docs"
    echo -e "  ${COLOR_GREEN}MySQL:${COLOR_RESET}    localhost:3306"
    echo ""

    print_header ">>> 常用命令"
    echo "  make help          - 查看所有可用命令"
    echo "  make status        - 查看服务状态"
    echo "  make logs          - 查看服务日志"
    echo "  make stop          - 停止服务"
    echo "  make restart       - 重启服务"
    echo ""
}

# 主流程
main() {
    print_header "========================================="
    print_header "   Spot 项目 Docker 快速部署"
    print_header "========================================="
    echo ""

    check_dependencies
    setup_env_file
    create_directories
    start_services
    wait_for_services
    show_services_info

    print_success "部署完成!"
}

# 运行主流程
main

#!/bin/bash

# 数据库初始化验证脚本
# 用于验证 Docker Compose MySQL 容器是否成功加载 init.sql

set -e

# 颜色定义
COLOR_RESET='\033[0m'
COLOR_GREEN='\033[32m'
COLOR_YELLOW='\033[33m'
COLOR_BLUE='\033[34m'
COLOR_RED='\033[31m'

print_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $1"
}

print_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_RESET} $1"
}

print_error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $1"
}

print_header() {
    echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
    echo -e "${COLOR_BLUE}$1${COLOR_RESET}"
    echo -e "${COLOR_BLUE}========================================${COLOR_RESET}"
}

# 检查 MySQL 容器是否运行
check_mysql_container() {
    print_info "检查 MySQL 容器状态..."

    if ! docker ps | grep -q spot-mysql; then
        print_error "MySQL 容器未运行"
        print_info "请先启动服务: make deploy"
        exit 1
    fi

    print_success "MySQL 容器正在运行"
}

# 等待 MySQL 就绪
wait_for_mysql() {
    print_info "等待 MySQL 就绪..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker exec spot-mysql mysqladmin ping -h localhost -uroot -p${MYSQL_ROOT_PASSWORD:-spot_password} 2>/dev/null | grep -q "mysqld is alive"; then
            print_success "MySQL 已就绪"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    print_error "MySQL 启动超时"
    exit 1
}

# 验证数据库是否存在
check_database() {
    print_info "检查数据库是否存在..."

    local db_exists=$(docker exec spot-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-spot_password} -e "SHOW DATABASES LIKE 'spot';" 2>/dev/null | grep -c "spot" || true)

    if [ "$db_exists" -eq 0 ]; then
        print_error "数据库 'spot' 不存在"
        return 1
    fi

    print_success "数据库 'spot' 存在"
}

# 验证表是否存在
check_tables() {
    print_info "检查数据表..."

    local tables=$(docker exec spot-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-spot_password} spot -e "SHOW TABLES;" 2>/dev/null | tail -n +2)
    local table_count=$(echo "$tables" | wc -l | tr -d ' ')

    if [ "$table_count" -lt 10 ]; then
        print_error "表数量不足（发现 $table_count 个表）"
        return 1
    fi

    print_success "发现 $table_count 个数据表"

    # 列出所有表
    print_info "数据表列表:"
    echo "$tables" | while read table; do
        echo "  - $table"
    done
}

# 验证数据是否加载
check_data() {
    print_info "检查数据..."

    # 检查几个关键表的数据
    local tables=("admins" "courses" "teachers" "communities")

    for table in "${tables[@]}"; do
        local count=$(docker exec spot-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-spot_password} spot -e "SELECT COUNT(*) FROM $table;" 2>/dev/null | tail -n 1)

        if [ "$count" -gt 0 ]; then
            print_success "表 '$table' 有 $count 条记录"
        else
            print_error "表 '$table' 没有数据"
            return 1
        fi
    done
}

# 显示统计信息
show_statistics() {
    print_header "数据库统计信息"

    local tables=$(docker exec spot-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-spot_password} spot -e "SHOW TABLES;" 2>/dev/null | tail -n +2)

    echo ""
    printf "%-20s %s\n" "表名" "记录数"
    echo "----------------------------------------"

    echo "$tables" | while read table; do
        local count=$(docker exec spot-mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-spot_password} spot -e "SELECT COUNT(*) FROM $table;" 2>/dev/null | tail -n 1)
        printf "%-20s %s\n" "$table" "$count"
    done

    echo ""
}

# 主流程
main() {
    print_header "数据库初始化验证"
    echo ""

    # 读取环境变量
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi

    check_mysql_container
    wait_for_mysql
    echo ""

    check_database
    check_tables
    echo ""

    check_data
    echo ""

    show_statistics

    print_success "数据库初始化验证完成！"
}

# 运行主流程
main

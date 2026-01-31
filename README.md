# 义城上门教育 - 快速启动指南

## 项目概述

义城上门教育是一款微信小程序平台，专注于为家长提供便捷的儿童体育培训课程预约服务。

## 技术栈

- **后端**: Python 3.12 + FastAPI + SQLAlchemy + MySQL
- **管理后台**: React 18 + TypeScript + Vite + Ant Design
- **小程序**: 微信小程序原生开发

## 环境要求

- Python 3.12+
- Node.js 18+
- MySQL 8.0+
- 微信开发者工具（小程序开发）

## 快速启动

### 1. 数据库初始化

```bash
# 连接数据库并执行初始化脚本
mysql -h 127.0.0.1 -u root -pClh181008 < sqls/spot.sql
```

### 2. 启动后端服务

```bash
cd backend

# 安装依赖（首次运行）
uv sync

# 启动开发服务器
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**访问地址**:
- API 文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/api/v1/health
- 根路径: http://localhost:8000/

### 3. 启动管理后台

```bash
cd admin-web

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

**访问地址**: http://localhost:5173

**默认管理员账号**:
- 用户名: `admin`
- 密码: `admin123`

### 4. 启动小程序

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram` 目录
3. AppID 选择"测试号"或使用实际 AppID
4. 点击"编译"即可预览

## 项目结构

```
spot/
├── backend/          # 后端服务
│   ├── src/         # 源代码
│   ├── uploads/     # 文件上传目录
│   ├── logs/        # 日志目录
│   └── .env         # 环境变量
├── admin-web/       # 管理后台
│   ├── src/         # 源代码
│   └── .env         # 环境变量
├── miniprogram/     # 微信小程序
│   ├── pages/       # 页面
│   └── components/  # 组件
├── sqls/            # 数据库脚本
├── docs/            # 文档
└── specs/           # 需求和设计文档
```

## 开发文档

- [产品需求文档](specs/0001-prd.md)
- [系统设计文档](specs/0002-design.md)
- [开发计划](specs/0003-plan.md)
- [阶段一总结](docs/phase-01-summary.md)

## 常用命令

### 后端

```bash
# 安装新依赖
uv add <package-name>

# 运行测试
uv run pytest

# 查看日志
tail -f backend/logs/app.log
```

### 管理后台

```bash
# 安装新依赖
npm install <package-name>

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 数据库连接信息

- 主机: 127.0.0.1
- 端口: 3306
- 用户: root
- 密码: Clh181008
- 数据库: spot

## API 文档

启动后端服务后访问: http://localhost:8000/docs

## 开发规范

请参考 [CLAUDE.md](CLAUDE.md) 查看详细的开发规范。

## 常见问题

### 1. 后端启动失败

**问题**: 数据库连接失败

**解决**:
- 检查 MySQL 服务是否启动
- 检查 `.env` 文件中的数据库配置
- 确认数据库 `spot` 已创建

### 2. 管理后台启动失败

**问题**: 依赖安装失败

**解决**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. 小程序编译错误

**问题**: TabBar 图标找不到

**解决**:
- TabBar 图标为可选，不影响开发
- 正式开发时需添加图标到 `miniprogram/assets/icons/`

## 联系方式

如有问题请查看文档或联系开发团队。

---

**祝开发顺利！🎉**

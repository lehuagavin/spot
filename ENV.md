# 环境变量配置说明

## 后端环境变量 (backend/.env)

复制 `backend/.env.example` 为 `backend/.env` 并填入以下配置：

### 必填配置

```bash
# 数据库连接（必填）
DATABASE_URL=mysql+asyncmy://root:your_password@127.0.0.1:3306/spot

# JWT 密钥（必填，生产环境请使用强随机字符串）
SECRET_KEY=your-secret-key-here-change-in-production
```

### 可选配置

```bash
# 应用配置
APP_NAME=spot
APP_ENV=development
DEBUG=true

# CORS 配置（根据前端地址调整）
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# 日志配置
LOG_LEVEL=INFO
```

### 微信配置（小程序功能需要）

```bash
# 微信小程序配置
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret

# 微信支付配置（可选）
WECHAT_MCH_ID=your-mch-id
WECHAT_API_KEY=your-api-key
```

---

## 前端环境变量 (admin-web/.env)

复制 `admin-web/.env.example` 为 `admin-web/.env` 并填入以下配置：

```bash
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 安全提示

⚠️ **重要**: `.env` 文件包含敏感信息，已被 `.gitignore` 排除，不会被提交到版本控制。

- 不要将 `.env` 文件提交到 Git
- 不要在代码中硬编码敏感信息
- 生产环境使用强随机字符串作为 SECRET_KEY
- 定期更新密钥和密码

---

## 快速开始

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入实际配置
uv run uvicorn src.main:app --reload
```

### 前端

```bash
cd admin-web
cp .env.example .env
# 编辑 .env 填入实际配置（可选）
npm install
npm run dev
```

---

## 配置项说明

| 配置项 | 说明 | 示例值 | 必填 |
|--------|------|--------|------|
| DATABASE_URL | MySQL 数据库连接字符串 | mysql+asyncmy://root:password@127.0.0.1:3306/spot | ✅ |
| SECRET_KEY | JWT 签名密钥 | your-secret-key-change-in-production | ✅ |
| APP_ENV | 应用环境 | development / production | ❌ |
| DEBUG | 调试模式 | true / false | ❌ |
| LOG_LEVEL | 日志级别 | DEBUG / INFO / WARNING / ERROR | ❌ |
| CORS_ORIGINS | 跨域允许的源 | ["http://localhost:5173"] | ❌ |
| WECHAT_APP_ID | 微信小程序 AppID | wxXXXXXXXXXXXXXXXX | ⚠️ |
| WECHAT_APP_SECRET | 微信小程序 AppSecret | XXXXXXXXXXXXXXXXXXXXXXXX | ⚠️ |

⚠️ = 小程序功能需要

---

*最后更新: 2026-01-31*

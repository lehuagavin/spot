# 阿里云部署后 API 请求问题修复

## 🔧 问题

部署到阿里云后，登录报错：
```
Network Error
Request URL: http://localhost:8000/api/v1/admin/auth/login
```

**原因**：前端请求 `localhost:8000`，这在服务器上是错误的地址。

## ✅ 解决方案：Nginx 反向代理

使用相对路径 `/api`，通过 Nginx 统一代理前后端。

### 架构

```
浏览器
  ↓
http://your-server.com  (80 端口)
  ↓
Nginx (web 容器)
  ├─ /          → 前端静态文件
  ├─ /api       → 反向代理到 backend:8000
  └─ /uploads   → 反向代理到 backend:8000
```

### 已修改的文件

1. **admin-web/.env.production** （新建）
   ```
   VITE_API_BASE_URL=
   ```
   空字符串 = 使用相对路径

2. **admin-web/Dockerfile**
   - 添加 `/api` 反向代理到 `backend:8000`
   - 添加 `/uploads` 反向代理到 `backend:8000`

## 🚀 重新部署步骤

### 本地操作

```bash
cd /path/to/spot

# 1. 重新构建前端（使用生产环境配置）
make build-web

# 2. 提交构建产物
git add builds/web/
git add admin-web/.env.production
git add admin-web/Dockerfile
git commit -m 'fix: add nginx reverse proxy for production deployment'
git push
```

### 服务器操作

```bash
# SSH 登录服务器
ssh user@your-server

# 进入项目目录
cd /path/to/spot

# 拉取最新代码
git pull

# 重新部署 Web 服务
make deploy SERVICE=web

# 等待部署完成，查看状态
make status
```

## 🔍 验证

部署完成后：

### 1. 检查容器状态
```bash
make status

# 应该看到：
# spot-web       Up (healthy)
# spot-backend   Up (healthy)
# spot-mysql     Up (healthy)
```

### 2. 测试 API 代理

```bash
# 在服务器上测试
curl http://localhost:3000/api/v1/health

# 应该返回后端的健康检查响应
```

### 3. 浏览器测试

打开浏览器访问：
- 前端：`http://your-server-ip:3000`
- 尝试登录：`admin / admin123`

检查浏览器开发者工具（F12）：
- Network 标签页
- 查看登录请求的 URL
- 应该是：`http://your-server-ip:3000/api/v1/admin/auth/login`
- 而不是：`http://localhost:8000/...`

## 📊 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Nginx 反向代理**（已采用） | ✅ 不需要为每个环境重新构建<br>✅ 统一入口，便于配置 HTTPS<br>✅ 跨域问题自动解决 | 需要配置 Nginx |
| 构建时指定 API URL | 简单 | ❌ 每个环境需要单独构建<br>❌ 跨域问题需要后端配置 |

## 🌐 配置域名（可选）

如果有域名，可以进一步配置：

### 1. 服务器端 Nginx（宿主机）

创建 `/etc/nginx/sites-available/spot`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/spot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 配置 HTTPS（Let's Encrypt）

```bash
sudo certbot --nginx -d your-domain.com
```

配置完成后访问：`https://your-domain.com`

## 🐛 故障排查

### 问题 1：仍然请求 localhost

**检查**：
```bash
# 查看前端构建产物中的配置
cat builds/web/latest/assets/index-*.js | grep -o "http://localhost:8000"
```

如果仍然有 `localhost:8000`，说明构建时没有使用 `.env.production`。

**解决**：
```bash
# 确认 .env.production 存在
cat admin-web/.env.production

# 重新构建（Vite 会自动使用 .env.production）
cd admin-web
npm run build

# 或者强制指定模式
npm run build -- --mode production
```

### 问题 2：API 代理 502 错误

**检查后端容器**：
```bash
docker logs spot-backend

# 确保后端正常运行
curl http://localhost:8000/health
```

**检查 Docker 网络**：
```bash
# Web 和 Backend 必须在同一网络
docker network inspect spot_spot-network

# 应该看到 spot-web 和 spot-backend 都在这个网络中
```

### 问题 3：CORS 错误

如果使用反向代理，应该**不会**有 CORS 问题（因为前后端同源）。

如果仍然出现，检查：
```bash
# 查看 Nginx 日志
docker logs spot-web

# 查看后端日志
docker logs spot-backend
```

## 📝 相关配置文件

### admin-web/.env（本地开发）
```
VITE_API_BASE_URL=http://localhost:8000
```

### admin-web/.env.production（生产环境）
```
VITE_API_BASE_URL=
```

### Vite 构建行为

```bash
# 开发模式（使用 .env）
npm run dev
# → VITE_API_BASE_URL = http://localhost:8000

# 生产构建（使用 .env.production）
npm run build
# → VITE_API_BASE_URL = "" (空字符串，使用相对路径)
```

## ✅ 总结

1. **本地开发**：使用 `http://localhost:8000`
2. **生产环境**：使用相对路径 `/api`，通过 Nginx 代理
3. **无需重复构建**：一次构建，任意服务器部署

---

**修复完成时间**：2026-02-01
**状态**：✅ 已修复并验证

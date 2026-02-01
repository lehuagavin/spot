# SSL/HTTPS 部署指南

## 📁 SSL 证书目录结构

SSL 证书应放置在服务器的 `/ssl` 目录下（或通过环境变量指定的其他路径）：

```
/ssl/
├── cert.pem       # SSL 证书文件（公钥，包含证书链）
└── cert.key       # SSL 私钥文件
```

## 🚀 部署配置

### 1. 确认 SSL 证书

检查服务器上的证书文件：

```bash
# SSH 登录服务器
ssh user@server

# 检查证书文件
ls -l /ssl/

# 应该看到：
# -rw-r--r-- 1 root root 3813 Feb  1 12:42 cert.pem
# -rw-r--r-- 1 root root 1675 Feb  1 12:42 cert.key
```

### 2. 配置环境变量（可选）

如果 SSL 证书不在 `/ssl` 目录，可以通过环境变量指定：

创建或编辑 `.env` 文件：

```bash
# SSL 证书路径（默认：/ssl）
SSL_CERT_PATH=/path/to/your/ssl

# Web 端口配置
WEB_HTTP_PORT=80          # HTTP 端口（会重定向到 HTTPS）
WEB_HTTPS_PORT=443        # HTTPS 端口

# Backend 端口
BACKEND_PORT=8000
```

### 3. 部署服务

```bash
# 拉取最新代码
cd /path/to/spot
git pull

# 部署（会自动挂载 SSL 目录）
make deploy

# 或分别部署
make deploy SERVICE=web
make deploy SERVICE=backend
```

### 4. 验证 HTTPS

```bash
# 检查容器是否正常运行
docker ps | grep spot

# 测试 HTTPS 连接
curl -I https://your-domain.com

# 查看证书信息
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## 📊 服务端口配置

### 默认端口

| 服务 | HTTP | HTTPS |
|------|------|-------|
| Web 前端 | 80 → 重定向到 443 | 443 |
| Backend API | 8000 | - |

### 端口映射

docker-compose.yml 配置：

```yaml
web:
  ports:
    - "80:80"      # HTTP（重定向到 HTTPS）
    - "443:443"    # HTTPS
  volumes:
    - /ssl:/ssl:ro # 只读挂载 SSL 证书

backend:
  ports:
    - "8000:8000"  # HTTP（内部通信）
  volumes:
    - /ssl:/ssl:ro # SSL 证书（备用）
```

## 🔄 访问方式

### Web 前端

- **HTTP**: `http://your-domain.com` → 自动重定向到 HTTPS
- **HTTPS**: `https://your-domain.com` ✅

### Backend API

- **HTTP**: `http://your-domain.com/api/...` → 通过前端代理，自动升级到 HTTPS
- **直接访问**: `http://your-domain.com:8000/api/...` (不推荐)

### 推荐访问方式

所有请求通过前端 HTTPS 访问：
```
https://your-domain.com       → Web 前端
https://your-domain.com/api   → Backend API（通过 Nginx 代理）
```

## 🛠️ 故障排查

### 问题 1: 容器启动失败，提示找不到证书文件

**错误信息**:
```
nginx: [emerg] cannot load certificate "/ssl/cert.pem"
```

**检查**:
```bash
# 检查证书文件是否存在
ls -l /ssl/

# 检查容器内的挂载
docker exec spot-web ls -l /ssl/

# 检查文件权限
ls -la /ssl/
```

**解决**:
```bash
# 确保证书文件存在且权限正确
sudo chmod 600 /ssl/cert.pem /ssl/key.pem

# 重启容器
make restart SERVICE=web
```

### 问题 2: 浏览器提示"不安全"或"证书无效"

**原因**:
- 使用了自签名证书
- 证书域名与访问域名不匹配
- 证书已过期

**解决**:

**自签名证书（开发环境）**:
- Chrome: 点击"高级" → "继续访问"
- Firefox: 点击"高级" → "接受风险并继续"

**生产环境**:
- 使用受信任 CA 签发的证书（Let's Encrypt、阿里云等）
- 确保证书域名与访问域名匹配

### 问题 3: HTTP 没有重定向到 HTTPS

**检查**:
```bash
# 测试 HTTP 请求
curl -I http://your-domain.com

# 应该看到 301 重定向
# HTTP/1.1 301 Moved Permanently
# Location: https://your-domain.com/
```

**解决**:
```bash
# 查看 Nginx 配置
docker exec spot-web cat /etc/nginx/conf.d/default.conf

# 重新构建镜像
make build SERVICE=web
make restart SERVICE=web
```

### 问题 4: API 请求失败（Mixed Content）

**错误**: 浏览器控制台显示 "Mixed Content" 错误

**原因**: HTTPS 页面请求了 HTTP 资源

**解决**:
确保前端配置使用相对路径或 HTTPS：

```typescript
// admin-web/.env.production
VITE_API_BASE_URL=

// 使用相对路径，自动继承当前协议（HTTPS）
```

### 问题 5: 证书即将过期

**检查证书有效期**:
```bash
openssl x509 -in /ssl/cert.pem -noout -dates
```

**续期证书**（Let's Encrypt）:
```bash
# 使用 certbot 自动续期
sudo certbot renew

# 重启服务
make restart SERVICE=web
```

## 🔐 安全建议

### 1. 证书文件权限

```bash
# SSL 目录权限
sudo chmod 700 /ssl

# 证书文件权限
sudo chmod 600 /ssl/cert.pem
sudo chmod 600 /ssl/key.pem

# 所有者（根据实际情况调整）
sudo chown root:root /ssl/*
```

### 2. 防火墙配置

```bash
# 允许 HTTPS 流量
sudo ufw allow 443/tcp

# 允许 HTTP（用于重定向）
sudo ufw allow 80/tcp

# 关闭直接访问 Backend（可选）
# sudo ufw deny 8000/tcp
```

### 3. SSL 配置优化

当前配置已包含：
- ✅ TLS 1.2 和 1.3
- ✅ 强加密套件
- ✅ HSTS（强制 HTTPS）
- ✅ 安全响应头

### 4. 定期更新证书

- **Let's Encrypt**: 每 90 天需要续期
- **其他 CA**: 根据证书有效期设置提醒
- 建议配置自动续期（certbot）

## 📝 Let's Encrypt 免费证书

### 使用 Certbot 获取证书

```bash
# 安装 certbot
sudo apt-get update
sudo apt-get install certbot

# 获取证书（需要停止 Web 服务）
sudo systemctl stop nginx  # 如果服务器运行了 Nginx
sudo certbot certonly --standalone -d your-domain.com

# 证书文件位置
# cert.pem: /etc/letsencrypt/live/your-domain.com/fullchain.pem
# key.pem:  /etc/letsencrypt/live/your-domain.com/privkey.pem

# 复制到 /ssl 目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /ssl/key.pem
sudo chmod 600 /ssl/*.pem
```

### 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# 配置 cron 任务自动续期
sudo crontab -e

# 添加任务（每月 1 日凌晨 2 点）
0 2 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /ssl/cert.pem && cp /etc/letsencrypt/live/your-domain.com/privkey.pem /ssl/key.pem && docker restart spot-web
```

## 🔄 从 HTTP 迁移到 HTTPS

### 迁移步骤

1. **准备证书**（见上文）

2. **更新代码**
   ```bash
   git pull
   ```

3. **重新构建并部署**
   ```bash
   make build-web
   make deploy
   ```

4. **测试 HTTPS 访问**
   ```bash
   curl -I https://your-domain.com
   ```

5. **验证 HTTP 重定向**
   ```bash
   curl -I http://your-domain.com
   # 应该看到 301 重定向到 HTTPS
   ```

### 注意事项

- HTTP 请求会自动重定向到 HTTPS
- API 请求通过前端代理，自动使用 HTTPS
- 确保前端环境变量 `VITE_API_BASE_URL` 为空（使用相对路径）

## 📚 相关文档

- [Docker 部署文档](DOCKER.md)
- [阿里云部署指南](ALIYUN-DEPLOY.md)
- [上传文件同步指南](UPLOADS-SYNC.md)

---

**最佳实践**：
- 生产环境使用 Let's Encrypt 或商业证书
- 开发环境使用自签名证书
- 定期检查证书有效期
- 启用 HSTS 强制 HTTPS
- 配置自动续期避免证书过期

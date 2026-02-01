# 上传文件同步指南

## 📁 目录结构

```
backend/uploads/
├── 20260131/         # 按日期组织的上传文件（提交到 Git）
│   ├── xxx.jpg
│   └── ...
├── images/           # 图片目录
└── temp/             # 临时文件目录
```

## 🎯 设计原则

1. **上传文件提交到 Git**
   - 代码和上传文件都通过 Git 管理
   - 适用于上传文件总量不大的项目（< 1GB）
   - 部署简单，无需额外同步步骤

2. **Docker Volume 挂载**
   - docker-compose.yml 已配置：`./backend/uploads:/app/uploads`
   - 容器会直接使用宿主机的 uploads 目录
   - Git pull 后文件自动可用于容器

3. **服务器部署**
   - 直接 git pull 即可获取最新上传文件
   - 无需额外的 rsync 或文件同步操作

## 🚀 部署流程

### Git 提交方式（当前方案）

#### 1. 本地开发添加上传文件

```bash
# 上传的文件自动保存到 backend/uploads/
# 提交到 Git
git add backend/uploads/
git commit -m 'chore: add upload files'
git push
```

#### 2. 服务器部署

```bash
# SSH 登录服务器
ssh user@server

# 拉取最新代码（包含上传文件）
cd /path/to/spot
git pull

# 检查文件
ls -lah backend/uploads/
du -sh backend/uploads/*

# 重启容器以确保挂载最新文件
make restart SERVICE=backend
```

#### 3. 验证

```bash
# 验证容器内文件
docker exec spot-backend ls -lah /app/uploads/

# 应该看到所有上传的文件
# 35M  /app/uploads/20260131/
```

### 注意事项

**适用场景**：
- ✅ 上传文件总量较小（< 1GB）
- ✅ 部署流程简单，无需额外工具
- ✅ 适合小型项目和团队

**不推荐场景**：
- ❌ 上传文件总量很大（> 1GB）
  - Git 仓库会变大
  - git clone/pull 速度会变慢
- ❌ 上传文件频繁变更
  - 每次提交都会增加仓库大小
  - 建议改用云存储（OSS/S3）

### 大型项目方案：使用云存储（生产推荐）

如果上传文件超过 1GB，强烈建议使用阿里云 OSS 或 AWS S3：

#### 1. 修改后端配置

```python
# backend/.env
STORAGE_TYPE=oss  # 或 s3

# OSS 配置
OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
OSS_BUCKET=your-bucket
OSS_ACCESS_KEY=your-access-key
OSS_SECRET_KEY=your-secret-key
```

#### 2. 上传现有文件到 OSS

```bash
# 使用 ossutil 工具
ossutil cp -r backend/uploads/ oss://your-bucket/uploads/
```

#### 3. 优点
- ✅ 不占用服务器磁盘空间
- ✅ 支持 CDN 加速
- ✅ 自动备份和容灾
- ✅ 按需扩展

## 🔄 日常工作流

### 本地开发

```bash
# 上传的文件自动保存到 backend/uploads/
# 可以随时查看
ls backend/uploads/

# 提交上传文件（如果有新文件）
git add backend/uploads/
git commit -m 'chore: add new upload files'
```

### 部署更新

```bash
# 1. 提交代码和上传文件
git add .
git commit -m 'feat: xxx'
git push

# 2. 服务器部署
ssh user@server
cd /path/to/spot
git pull
make deploy SERVICE=backend

# Git pull 会自动更新 backend/uploads/ 目录
# 容器通过 volume 挂载访问最新文件
```

## 📊 .gitignore 配置

当前配置（提交上传文件）：

```gitignore
# 后端上传目录（现在提交到 Git，便于部署）
# backend/uploads 的所有内容都会被提交到仓库
```

效果：
- ✅ 提交：`backend/uploads/*` 所有上传文件
- ✅ 简化部署：git pull 即可获取所有文件

## 🛠️ 故障排查

### 问题 1：容器中找不到上传的文件

**检查**：
```bash
# 检查 volume 挂载
docker inspect spot-backend | grep -A 5 Mounts

# 应该看到：
# "Source": "/path/to/spot/backend/uploads",
# "Destination": "/app/uploads",
```

**解决**：
```bash
# 确保服务器上有文件
ls -lah backend/uploads/

# 重启容器
make restart SERVICE=backend
```

### 问题 2：上传文件权限错误

**检查**：
```bash
# 查看文件所有者
ls -l backend/uploads/

# 查看容器内运行用户
docker exec spot-backend id
```

**解决**：
```bash
# 修改文件所有者（如果需要）
sudo chown -R 1000:1000 backend/uploads/
```

### 问题 3：Git 仓库太大

**问题**：
- 上传文件太多，git clone/pull 很慢
- 仓库体积超过 1GB

**解决**：
```bash
# 方案 1：删除历史大文件（慎用）
# 使用 git filter-branch 或 BFG Repo-Cleaner 清理历史

# 方案 2：迁移到云存储（推荐）
# 参考下文"使用云存储"部分
```

### 问题 4：需要忽略特定上传文件

**场景**：
- 某些临时文件不想提交到 Git
- 测试文件不需要部署

**解决**：
```bash
# 修改 .gitignore，添加特定规则
echo "backend/uploads/temp/*" >> .gitignore
echo "backend/uploads/test-*" >> .gitignore

# 已提交的文件从 Git 中移除但保留本地
git rm --cached backend/uploads/temp/*
git commit -m 'chore: ignore temp uploads'
```

## ✅ 最佳实践

1. **小型项目**（< 100MB 上传文件）
   - ✅ 使用 Git 提交（当前方案）
   - ✅ 部署简单，无需额外工具

2. **中型项目**（100MB - 1GB）
   - ⚠️ 可以使用 Git，但需注意：
     - git clone 时间会变长
     - 定期清理不需要的文件
   - 💡 建议：考虑迁移到云存储

3. **大型项目**（> 1GB）
   - ❌ 不要使用 Git 提交上传文件
   - ✅ **必须使用云存储**（OSS/S3）
   - 本地只保留最近的文件

4. **生产环境**
   - 推荐云存储 + CDN
   - 备份策略
   - 监控磁盘使用

## 🔄 从 Git 迁移到云存储

如果项目增长，上传文件超过 1GB，建议迁移：

```bash
# 1. 配置云存储（参考上文）
# 修改 backend/.env，配置 OSS/S3

# 2. 上传现有文件到云存储
ossutil cp -r backend/uploads/ oss://your-bucket/uploads/

# 3. 修改 .gitignore，停止提交新上传文件
echo "backend/uploads/*" >> .gitignore
echo "!backend/uploads/.gitkeep" >> .gitignore

# 4. 从 Git 历史中移除上传文件（可选，减小仓库体积）
# 使用 BFG Repo-Cleaner 或 git filter-branch
```

## 📚 相关文档

- [Docker 部署文档](DOCKER.md)
- [阿里云部署指南](ALIYUN-DEPLOY.md)

---

**核心原则**：
- 小型项目：代码和数据都用 Git（简单方便）
- 大型项目：代码用 Git，数据用云存储（OSS/S3）

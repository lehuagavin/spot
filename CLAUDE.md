# CLAUDE.md - 项目开发规范

## 设计原则

### SOLID 原则

- **S - 单一职责原则 (SRP)**: 每个模块/类/函数只负责一件事
- **O - 开闭原则 (OCP)**: 对扩展开放，对修改关闭
- **L - 里氏替换原则 (LSP)**: 子类必须能够替换其父类
- **I - 接口隔离原则 (ISP)**: 客户端不应依赖它不需要的接口
- **D - 依赖倒置原则 (DIP)**: 依赖抽象而非具体实现

### 其他核心原则

- **DRY (Don't Repeat Yourself)**: 避免重复代码，抽取公共逻辑
- **KISS (Keep It Simple, Stupid)**: 保持简单，避免过度设计
- **YAGNI (You Aren't Gonna Need It)**: 不要实现当前不需要的功能
- **关注点分离**: 不同的功能模块保持独立
- **最小惊讶原则**: 代码行为应符合预期

---

## 前端技术栈 (React/TypeScript/Tailwind)

### 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础 UI 组件
│   └── features/       # 业务功能组件
├── hooks/              # 自定义 Hooks
├── pages/              # 页面组件
├── services/           # API 服务层
├── stores/             # 状态管理
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── lib/                # 第三方库封装
```

### TypeScript 规范

```typescript
// 优先使用 interface 定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

// 使用 type 定义联合类型、交叉类型
type Status = 'pending' | 'success' | 'error';

// 禁止使用 any，使用 unknown 代替
function parseJSON(text: string): unknown {
  return JSON.parse(text);
}

// 使用泛型提高复用性
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}
```

### React 组件规范

```typescript
// 使用函数组件 + Hooks
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  disabled = false,
  onClick,
  children
}: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md transition-colors',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 状态管理

```typescript
// 优先使用 React 内置状态管理
// 简单状态: useState
// 复杂状态: useReducer
// 全局状态: Context API 或 Zustand

// Zustand 示例
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => set({ user: null }),
}));
```

### 错误处理 (前端)

```typescript
// API 错误处理
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.code ?? 'UNKNOWN_ERROR',
      error.message ?? 'An unexpected error occurred'
    );
  }

  return response.json();
}

// 组件中的错误边界
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-semibold">Something went wrong</h2>
      <pre className="text-sm text-red-600">{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// 使用
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

### Tailwind CSS 规范

```typescript
// 使用 clsx/tailwind-merge 组合类名
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 组件变体使用 cva
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

## 后端技术栈 (Python/FastAPI/uv)

### 项目结构

```
src/
├── api/                # API 路由层
│   ├── v1/            # API 版本
│   │   ├── endpoints/ # 具体端点
│   │   └── router.py  # 路由聚合
│   └── deps.py        # 依赖注入
├── core/              # 核心配置
│   ├── config.py      # 应用配置
│   ├── security.py    # 安全相关
│   └── logging.py     # 日志配置
├── models/            # 数据模型
│   ├── domain/        # 领域模型
│   └── schemas/       # Pydantic schemas
├── services/          # 业务逻辑层
├── repositories/      # 数据访问层
├── utils/             # 工具函数
└── main.py            # 应用入口
```

### Python 代码规范

```python
# 使用类型注解
from typing import Optional, List
from datetime import datetime

def process_users(
    users: List[User],
    *,
    active_only: bool = True,
    limit: Optional[int] = None,
) -> List[ProcessedUser]:
    """处理用户列表。

    Args:
        users: 用户列表
        active_only: 是否只处理活跃用户
        limit: 返回结果数量限制

    Returns:
        处理后的用户列表
    """
    ...
```

### FastAPI 最佳实践

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/users", tags=["users"])

# Pydantic Schema 定义
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}

# 依赖注入
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    user = await user_service.get_by_token(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user

# 路由定义
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    return await user_service.create(db, user_data)
```

### 错误处理 (后端)

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# 自定义异常
class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class NotFoundError(AppException):
    def __init__(self, resource: str, id: str | int):
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource} with id {id} not found",
            status_code=404,
        )

class ValidationError(AppException):
    def __init__(self, message: str, details: dict):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details,
        )

# 全局异常处理器
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
        },
    )
```

### 日志处理

```python
import logging
import sys
from datetime import datetime
import structlog

def setup_logging(log_level: str = "INFO"):
    """配置结构化日志"""

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, log_level)
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
    )

# 使用
logger = structlog.get_logger()

async def create_user(user_data: UserCreate):
    logger.info("creating_user", email=user_data.email)
    try:
        user = await user_service.create(user_data)
        logger.info("user_created", user_id=user.id)
        return user
    except Exception as e:
        logger.error("user_creation_failed", error=str(e))
        raise
```

### 并发处理

```python
import asyncio
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

# 数据库连接池
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# 并发任务处理
async def process_items_concurrently(
    items: list[Item],
    max_concurrency: int = 10,
) -> list[Result]:
    semaphore = asyncio.Semaphore(max_concurrency)

    async def process_with_semaphore(item: Item) -> Result:
        async with semaphore:
            return await process_item(item)

    return await asyncio.gather(
        *[process_with_semaphore(item) for item in items]
    )
```

### uv 包管理

```bash
# 初始化项目
uv init

# 添加依赖
uv add fastapi uvicorn sqlalchemy

# 添加开发依赖
uv add --dev pytest pytest-asyncio ruff mypy

# 运行命令
uv run python -m pytest
uv run uvicorn src.main:app --reload

# 同步依赖
uv sync
```

---

## 错误处理规范 (不可协商)

### 核心原则

1. **所有错误必须被显式处理** - 禁止忽略异常
2. **错误应在适当的层级处理** - 就近处理或向上传播
3. **提供有意义的错误信息** - 包含上下文和可操作建议
4. **区分可恢复和不可恢复错误** - 采取不同策略

### 前端错误处理清单

```typescript
// ✅ 正确: 显式处理错误
try {
  const data = await fetchUser(id);
  setUser(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      setError('User not found');
    } else {
      setError(error.message);
    }
  } else {
    setError('An unexpected error occurred');
    console.error('Fetch user failed:', error);
  }
}

// ❌ 错误: 忽略错误
try {
  const data = await fetchUser(id);
  setUser(data);
} catch {
  // 空的 catch 块是禁止的
}
```

### 后端错误处理清单

```python
# ✅ 正确: 显式处理并转换错误
async def get_user(user_id: int) -> User:
    try:
        user = await db.get(User, user_id)
        if not user:
            raise NotFoundError("User", user_id)
        return user
    except SQLAlchemyError as e:
        logger.error("database_error", user_id=user_id, error=str(e))
        raise AppException(
            code="DATABASE_ERROR",
            message="Failed to fetch user",
            status_code=500,
        )

# ❌ 错误: 使用裸 except
try:
    ...
except:  # 禁止使用裸 except
    pass
```

---

## Git 与版本控制

### Conventional Commits 规范

**格式**: `<type>(<scope>): <description>`

#### Type 类型

| Type | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档变更 |
| `style` | 代码格式 (不影响代码运行) |
| `refactor` | 重构 (既不是新功能也不是修复 bug) |
| `perf` | 性能优化 |
| `test` | 添加或修改测试 |
| `build` | 构建系统或外部依赖变更 |
| `ci` | CI 配置变更 |
| `chore` | 其他不修改 src 或 test 的变更 |
| `revert` | 回滚之前的提交 |

#### Scope 范围

根据项目模块定义，例如:
- `api`, `ui`, `db`, `auth`, `core`, `deps`

#### 示例

```bash
# 新功能
feat(auth): add OAuth2 login support

# Bug 修复
fix(api): handle null response in user endpoint

# 文档
docs(readme): update installation instructions

# 重构
refactor(core): extract validation logic to separate module

# 性能优化
perf(db): add index for user email lookup

# 带 Breaking Change
feat(api)!: change response format for user endpoint

BREAKING CHANGE: The user endpoint now returns an object instead of array
```

### 分支策略

```
main          - 生产环境分支
├── develop   - 开发分支
│   ├── feature/xxx   - 功能分支
│   ├── fix/xxx       - 修复分支
│   └── refactor/xxx  - 重构分支
└── release/x.x.x     - 发布分支
```

### PR 规范

```markdown
## Description
<!-- 简要描述变更内容 -->

## Type of Change
- [ ] feat: 新功能
- [ ] fix: Bug 修复
- [ ] refactor: 重构
- [ ] docs: 文档
- [ ] test: 测试

## Checklist
- [ ] 代码已自测
- [ ] 已添加必要的测试
- [ ] 已更新相关文档
- [ ] 符合代码规范
```

---

## 代码质量工具

### 前端

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest"
  }
}
```

### 后端

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP", "B", "A", "C4", "PT", "RET", "SIM"]

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_ignores = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

---

## 安全规范

1. **永远不要在代码中硬编码敏感信息** (API keys, passwords, secrets)
2. **使用环境变量管理配置**
3. **所有用户输入必须验证和清理**
4. **使用参数化查询防止 SQL 注入**
5. **实现适当的认证和授权**
6. **定期更新依赖以修复安全漏洞**

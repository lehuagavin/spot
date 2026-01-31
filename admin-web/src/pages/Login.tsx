/**
 * 登录页面 - Apple 风格设计
 */
import { useState } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { login as loginApi } from '../api/auth';
import type { LoginRequest } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await loginApi(values);
      login(response.token, response.admin);
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请检查用户名和密码';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)',
      }}
    >
      <div
        className="slide-up"
        style={{
          width: 400,
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '48px 40px 32px',
            textAlign: 'center',
            borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #0071e3 0%, #42a1ff 100%)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0, 113, 227, 0.3)',
            }}
          >
            <span style={{ fontSize: 28, color: '#fff', fontWeight: 600 }}>Y</span>
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 8,
            }}
          >
            义城上门教育
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            管理后台
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px 40px 40px' }}>
          <Spin spinning={loading}>
            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
                  placeholder="用户名"
                  style={{
                    height: 48,
                    fontSize: 'var(--font-size-md)',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
                  placeholder="密码"
                  style={{
                    height: 48,
                    fontSize: 'var(--font-size-md)',
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{
                    height: 48,
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 500,
                  }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Spin>

          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            默认账号: admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

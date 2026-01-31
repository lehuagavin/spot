/**
 * 认证状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '../types';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  updateAdmin: (admin: Partial<Admin>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      login: (token, admin) => {
        set({ token, admin, isAuthenticated: true });
      },
      logout: () => {
        set({ token: null, admin: null, isAuthenticated: false });
      },
      updateAdmin: (updates) => {
        const currentAdmin = get().admin;
        if (currentAdmin) {
          set({ admin: { ...currentAdmin, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

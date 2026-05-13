import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "teacher" | "admin";
  is_active: boolean;
  ai_personality?: string;
  ai_depth?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("rimn_token", token);
        set({ user, token });
      },
      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      },
      logout: () => {
        localStorage.removeItem("rimn_token");
        localStorage.removeItem("rimn_user");
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: "rimn_auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  role: string;
  fullname?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  expiresAt: number | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 1 kun

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      setAuth: (token, user) => {
        const expiresAt = Date.now() + SESSION_DURATION_MS;
        set({ token, user, expiresAt });
      },
      logout: () => {
        set({ token: null, user: null, expiresAt: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function validateSession() {
  const state = useAuthStore.getState();
  if (!state.token) return;

  if (!state.expiresAt) {
    useAuthStore.setState({ expiresAt: Date.now() + SESSION_DURATION_MS });
  } else if (Date.now() > state.expiresAt) {
    state.logout();
  }
}

export function isSessionValid(): boolean {
  const { token, expiresAt } = useAuthStore.getState();
  if (!token) return false;
  if (!expiresAt) return true;
  return Date.now() <= expiresAt;
}

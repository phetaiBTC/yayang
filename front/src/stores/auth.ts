import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, getToken, setToken, clearToken } from '../api/client';

export interface AuthUser {
  empId: number;
  username: string;
  role: 'admin' | 'staff';
}

const USER_KEY = 'auth_user';

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken());
  const user = ref<AuthUser | null>(loadUser());

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  /** Authenticate against the API and persist the session. */
  async function signIn(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password });
    const { access_token, user: authUser } = res.data.data as {
      access_token: string;
      user: AuthUser;
    };
    token.value = access_token;
    user.value = authUser;
    setToken(access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }

  function logout() {
    token.value = null;
    user.value = null;
    clearToken();
    localStorage.removeItem(USER_KEY);
  }

  return { token, user, isAuthenticated, isAdmin, signIn, logout };
});

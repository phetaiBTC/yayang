import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, getToken, setToken, clearToken } from '../api/client';
import { verifyCustomerLoginOtp } from '../api/registration';

export interface AuthUser {
  empId?: number;
  cusId?: number;
  username: string;
  role: 'admin' | 'staff' | 'customer';
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
  const isCustomer = computed(() => user.value?.role === 'customer');

  function persistSession(access_token: string, authUser: AuthUser) {
    token.value = access_token;
    user.value = authUser;
    setToken(access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }

  /** Employee login (username + password). */
  async function signIn(username: string, password: string) {
    const res = await api.post('/auth/login', { username, password });
    const { access_token, user: authUser } = res.data.data as {
      access_token: string;
      user: AuthUser;
    };
    persistSession(access_token, authUser);
  }

  /** Customer login step 2 (email + OTP code). */
  async function signInCustomer(email: string, code: string) {
    const { access_token, user: authUser } = await verifyCustomerLoginOtp(email, code);
    persistSession(access_token, authUser);
  }

  function logout() {
    token.value = null;
    user.value = null;
    clearToken();
    localStorage.removeItem(USER_KEY);
  }

  return { token, user, isAuthenticated, isAdmin, isCustomer, signIn, signInCustomer, logout };
});

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { useAuthStore } from '../stores/auth';

const username = ref('');
const password = ref('');
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

async function submit() {
  if (!username.value || !password.value) return;
  loading.value = true;
  try {
    await auth.signIn(username.value, password.value);
    const redirect = (route.query.redirect as string) || '/';
    await router.replace(redirect);
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Login failed',
      detail: e?.response?.data?.message ?? 'Invalid username or password',
      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-wrap">
    <div class="login-card">
      <h1 class="login-title">ລະບົບຈັດການຮ້ານຂາຍປຶ້ມ</h1>
      <p class="login-sub">ເຂົ້າສູ່ລະບົບ / Sign in</p>
      <form class="flex flex-column gap-3" @submit.prevent="submit">
        <InputText v-model="username" placeholder="Username" autocomplete="username" fluid />
        <Password
          v-model="password"
          placeholder="Password"
          :feedback="false"
          toggleMask
          fluid
          inputClass="w-full"
        />
        <Button
          type="submit"
          label="Login"
          icon="pi pi-sign-in"
          :loading="loading"
          fluid
        />
      </form>
      <p class="mt-3 login-register">
        New customer?
        <RouterLink :to="{ name: 'register' }">Register here</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.login-card {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--p-content-border-color, #e5e7eb);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}
.login-title {
  font-size: 1.15rem;
  margin: 0 0 0.25rem;
}
.login-sub {
  margin: 0 0 1.5rem;
  color: var(--p-text-muted-color, #6b7280);
}
</style>

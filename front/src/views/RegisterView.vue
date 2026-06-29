<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { register } from '../api/registration';

const name = ref('');
const phone = ref('');
const loading = ref(false);

const router = useRouter();
const toast = useToast();

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'Unexpected error';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

async function submit() {
  if (!name.value || !phone.value) return;
  loading.value = true;
  try {
    const res = await register(name.value, phone.value);
    router.push({
      name: 'verify-otp',
      query: { phone: phone.value, devOtp: res.devOtp ?? '' },
    });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Registration failed', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-wrap">
    <div class="auth-card">
      <h1 class="auth-title">ລົງທະບຽນລູກຄ້າ / Register</h1>
      <p class="auth-sub">Enter your details to receive a verification code.</p>
      <form class="flex flex-column gap-3" @submit.prevent="submit">
        <InputText v-model="name" placeholder="Full name" fluid />
        <InputText v-model="phone" placeholder="Phone number" fluid />
        <Button type="submit" label="Send code" icon="pi pi-send" :loading="loading" fluid />
      </form>
      <p class="mt-3">
        <RouterLink :to="{ name: 'login' }">Already have an account? Sign in</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.auth-card {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--p-content-border-color, #e5e7eb);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}
.auth-title {
  font-size: 1.15rem;
  margin: 0 0 0.25rem;
}
.auth-sub {
  margin: 0 0 1.5rem;
  color: var(--p-text-muted-color, #6b7280);
}
</style>

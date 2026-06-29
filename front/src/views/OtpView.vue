<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputOtp from 'primevue/inputotp';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { verifyOtp, resendOtp } from '../api/registration';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const phone = String(route.query.phone || '');
const devOtp = ref(String(route.query.devOtp || ''));
const code = ref('');
const loading = ref(false);
const resending = ref(false);

// Reached directly without a phone in the flow — send them back to register.
onMounted(() => {
  if (!phone) router.replace({ name: 'register' });
});

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'Unexpected error';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

async function verify() {
  if (code.value.length !== 6) return;
  loading.value = true;
  try {
    await verifyOtp(phone, code.value);
    toast.add({ severity: 'success', summary: 'Verified — you can now sign in', life: 3000 });
    router.push({ name: 'login' });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Verification failed', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function resend() {
  resending.value = true;
  try {
    const res = await resendOtp(phone);
    devOtp.value = res.devOtp ?? '';
    toast.add({ severity: 'info', summary: 'A new code has been sent', life: 3000 });
  } catch (e) {
    toast.add({ severity: 'warn', summary: 'Could not resend', detail: errorDetail(e), life: 4000 });
  } finally {
    resending.value = false;
  }
}
</script>

<template>
  <main class="auth-wrap">
    <div class="auth-card">
      <h1 class="auth-title">ຢືນຢັນ OTP / Verify</h1>
      <p class="auth-sub">Enter the 6-digit code sent for <strong>{{ phone }}</strong>.</p>

      <Message v-if="devOtp" severity="info" class="mb-3">Dev code: <strong>{{ devOtp }}</strong></Message>

      <div class="flex flex-column gap-3 align-items-center">
        <InputOtp v-model="code" :length="6" integerOnly />
        <Button
          label="Verify"
          icon="pi pi-check"
          :loading="loading"
          :disabled="code.length !== 6"
          fluid
          @click="verify"
        />
        <Button
          label="Resend code"
          icon="pi pi-refresh"
          severity="secondary"
          text
          :loading="resending"
          @click="resend"
        />
      </div>

      <p class="mt-3">
        <RouterLink :to="{ name: 'register' }">← Back to register</RouterLink>
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
  max-width: 380px;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--p-content-border-color, #e5e7eb);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  text-align: center;
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

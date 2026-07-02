<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputOtp from 'primevue/inputotp';
import Button from 'primevue/button';
import { verifyOtp, resendOtp } from '../api/registration';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const phone = String(route.query.phone || '');
const email = String(route.query.email || '');
const code = ref('');
const loading = ref(false);
const resending = ref(false);

// Reached directly without a phone in the flow — send them back to register.
onMounted(() => {
  if (!phone) router.replace({ name: 'register' });
});

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

async function verify() {
  if (code.value.length !== 6) return;
  loading.value = true;
  try {
    await verifyOtp(phone, code.value);
    toast.add({ severity: 'success', summary: 'ຢືນຢັນສຳເລັດ — ທ່ານສາມາດເຂົ້າສູ່ລະບົບໄດ້ແລ້ວ', life: 3000 });
    router.push({ name: 'customer-login', query: { email } });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ຢືນຢັນບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    loading.value = false;
  }
}

async function resend() {
  resending.value = true;
  try {
    await resendOtp(phone);
    toast.add({ severity: 'info', summary: 'ໄດ້ສົ່ງລະຫັດໃໝ່ແລ້ວ', life: 3000 });
  } catch (e) {
    toast.add({ severity: 'warn', summary: 'ສົ່ງລະຫັດຄືນບໍ່ໄດ້', detail: errorDetail(e), life: 4000 });
  } finally {
    resending.value = false;
  }
}
</script>

<template>
  <main class="auth-wrap">
    <div class="auth-card">
      <h1 class="auth-title">ຢືນຢັນ OTP</h1>
      <p class="auth-sub">ປ້ອນລະຫັດ 6 ຫຼັກທີ່ສົ່ງໄປຫາອີເມວ <strong>{{ email || phone }}</strong>.</p>

      <div class="flex flex-column gap-3 align-items-center">
        <InputOtp v-model="code" :length="6" integerOnly />
        <Button
          label="ຢືນຢັນ"
          icon="pi pi-check"
          :loading="loading"
          :disabled="code.length !== 6"
          fluid
          @click="verify"
        />
        <Button
          label="ສົ່ງລະຫັດຄືນ"
          icon="pi pi-refresh"
          severity="secondary"
          text
          :loading="resending"
          @click="resend"
        />
      </div>

      <p class="mt-3">
        <RouterLink :to="{ name: 'register' }">← ກັບໄປລົງທະບຽນ</RouterLink>
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

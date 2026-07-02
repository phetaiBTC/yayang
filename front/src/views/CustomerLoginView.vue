<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputOtp from 'primevue/inputotp';
import Button from 'primevue/button';
import { useAuthStore } from '../stores/auth';
import { requestCustomerLoginOtp } from '../api/registration';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const auth = useAuthStore();

const step = ref<'email' | 'code'>('email');
const email = ref(String(route.query.email || ''));
const code = ref('');
const sending = ref(false);
const verifying = ref(false);

function errorDetail(e: any): string {
  const m = e?.response?.data?.message ?? e?.message ?? 'ເກີດຂໍ້ຜິດພາດ';
  return Array.isArray(m) ? m.join(', ') : String(m);
}

async function sendCode() {
  if (!email.value) return;
  sending.value = true;
  try {
    await requestCustomerLoginOtp(email.value);
    step.value = 'code';
    toast.add({ severity: 'info', summary: 'ໄດ້ສົ່ງລະຫັດໄປຫາອີເມວແລ້ວ', life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ສົ່ງລະຫັດບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    sending.value = false;
  }
}

async function verify() {
  if (code.value.length !== 6) return;
  verifying.value = true;
  try {
    await auth.signInCustomer(email.value, code.value);
    const redirect = (route.query.redirect as string) || '';
    await router.replace(redirect || { name: 'my-account' });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ', detail: errorDetail(e), life: 4000 });
  } finally {
    verifying.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="brand">📚 ຮ້ານຂາຍປຶ້ມ</div>

    <div class="auth-center">
      <div class="auth-card">
        <h1 class="auth-title">ເຂົ້າສູ່ລະບົບລູກຄ້າ</h1>

        <template v-if="step === 'email'">
          <p class="auth-sub">ປ້ອນອີເມວທີ່ໃຊ້ລົງທະບຽນ ເພື່ອຮັບລະຫັດ OTP</p>
          <form class="auth-form" @submit.prevent="sendCode">
            <div class="field">
              <label>ອີເມວ</label>
              <InputText v-model="email" type="email" placeholder="ອີເມວ" autocomplete="email" fluid />
            </div>
            <Button type="submit" label="ສົ່ງລະຫັດ" icon="pi pi-arrow-right" iconPos="right" :loading="sending" fluid class="signin-btn" />
          </form>
        </template>

        <template v-else>
          <p class="auth-sub">ປ້ອນລະຫັດ 6 ຫຼັກທີ່ສົ່ງໄປຫາ <strong>{{ email }}</strong></p>
          <div class="flex flex-column gap-3 align-items-center">
            <InputOtp v-model="code" :length="6" integerOnly />
            <Button
              label="ເຂົ້າສູ່ລະບົບ"
              icon="pi pi-sign-in"
              :loading="verifying"
              :disabled="code.length !== 6"
              fluid
              class="signin-btn"
              @click="verify"
            />
            <Button label="ສົ່ງລະຫັດຄືນ" icon="pi pi-refresh" severity="secondary" text :loading="sending" @click="sendCode" />
          </div>
        </template>

        <p class="auth-register">
          <RouterLink :to="{ name: 'login' }">ພະນັກງານ? ເຂົ້າສູ່ລະບົບ</RouterLink>
          &nbsp;·&nbsp;
          <RouterLink :to="{ name: 'register' }">ລົງທະບຽນ</RouterLink>
        </p>
      </div>
    </div>

    <footer class="auth-footer">© 2025 ຮ້ານຂາຍປຶ້ມ · ສະຫງວນລິຂະສິດທັງໝົດ</footer>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 1.25rem;
  box-sizing: border-box;
  background:
    radial-gradient(55% 45% at 85% 12%, rgba(253, 245, 200, 0.95), transparent 70%),
    radial-gradient(45% 40% at 12% 22%, rgba(190, 224, 210, 0.85), transparent 72%),
    radial-gradient(90% 55% at 50% 118%, rgba(120, 195, 180, 0.95), transparent 70%),
    linear-gradient(160deg, #c8e2d6 0%, #bfe0c4 34%, #dbe6a4 60%, #a3d6ca 100%);
  background-attachment: fixed;
}

.brand {
  font-weight: 700;
  font-size: 1.15rem;
  color: #10321f;
  letter-spacing: 0.2px;
}

.auth-center {
  flex: 1 1 auto;
  display: grid;
  place-items: center;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 12px 40px rgba(20, 60, 45, 0.15);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  text-align: center;
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #10321f;
  margin: 0 0 0.25rem;
}
.auth-sub {
  color: #3f5c4c;
  margin: 0 0 1.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #274536;
}

:deep(.p-inputtext) {
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.8);
}

:deep(.signin-btn) {
  margin-top: 0.25rem;
  border-radius: 999px;
  padding: 0.8rem;
  font-weight: 600;
  background: #63a80f;
  border-color: #63a80f;
}
:deep(.signin-btn:hover) {
  background: #57950c;
  border-color: #57950c;
}

.auth-register {
  color: #3f5c4c;
  margin: 1rem 0 0;
  font-size: 0.9rem;
}
.auth-register a {
  color: #4f8a10;
  font-weight: 600;
  text-decoration: none;
}
.auth-register a:hover {
  text-decoration: underline;
}

.auth-footer {
  color: #33513f;
  font-size: 0.8rem;
  opacity: 0.85;
  padding-top: 1rem;
}
</style>

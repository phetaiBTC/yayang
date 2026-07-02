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
      summary: 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ',
      detail: e?.response?.data?.message ?? 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ',
      life: 3500,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="brand">📚 ຮ້ານຂາຍປຶ້ມ</div>

    <div class="login-center">
      <div class="login-card">
        <h1 class="login-title">ເຂົ້າສູ່ລະບົບ</h1>
        <p class="login-sub">ຍິນດີຕ້ອນຮັບກັບມາ!</p>

        <form class="login-form" @submit.prevent="submit">
          <div class="field">
            <label>ຊື່ຜູ້ໃຊ້</label>
            <InputText v-model="username" placeholder="ຊື່ຜູ້ໃຊ້" autocomplete="username" fluid />
          </div>
          <div class="field">
            <label>ລະຫັດຜ່ານ</label>
            <Password
              v-model="password"
              placeholder="ລະຫັດຜ່ານ"
              :feedback="false"
              toggleMask
              fluid
              inputClass="w-full"
            />
          </div>
          <Button
            type="submit"
            label="ເຂົ້າສູ່ລະບົບ"
            icon="pi pi-arrow-right"
            iconPos="right"
            :loading="loading"
            fluid
            class="signin-btn"
          />
        </form>

        <p class="login-register">
          ລູກຄ້າໃໝ່?
          <RouterLink :to="{ name: 'register' }">ລົງທະບຽນ</RouterLink>
        </p>
        <p class="login-register">
          ລູກຄ້າ?
          <RouterLink :to="{ name: 'customer-login' }">ເຂົ້າສູ່ລະບົບລູກຄ້າ</RouterLink>
        </p>
      </div>
    </div>

    <footer class="login-footer">© 2025 ຮ້ານຂາຍປຶ້ມ · ສະຫງວນລິຂະສິດທັງໝົດ</footer>
  </div>
</template>

<style scoped>
.login-page {
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

.login-center {
  flex: 1 1 auto;
  display: grid;
  place-items: center;
  width: 100%;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 2rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 12px 40px rgba(20, 60, 45, 0.15);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.login-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #10321f;
  margin: 0 0 0.25rem;
}
.login-sub {
  text-align: center;
  color: #3f5c4c;
  margin: 0 0 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

/* Pill-shaped inputs */
:deep(.p-inputtext) {
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.8);
}
:deep(.p-password) {
  width: 100%;
}

/* Green pill Sign-In button */
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

.login-register {
  text-align: center;
  color: #3f5c4c;
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
}
.login-register a {
  color: #4f8a10;
  font-weight: 600;
  text-decoration: none;
}
.login-register a:hover {
  text-decoration: underline;
}

.login-footer {
  color: #33513f;
  font-size: 0.8rem;
  opacity: 0.85;
  padding-top: 1rem;
}
</style>

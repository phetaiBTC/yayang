<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const items = computed(() => [
  { label: 'Dashboard', icon: 'pi pi-home', command: () => router.push('/') },
  { label: 'Books', icon: 'pi pi-book', command: () => router.push('/books') },
  { label: 'Purchasing', icon: 'pi pi-shopping-cart', command: () => router.push('/purchase-orders') },
  { label: 'Imports', icon: 'pi pi-download', command: () => router.push('/imports') },
  { label: 'Sales', icon: 'pi pi-dollar', command: () => router.push('/sales') },
  { label: 'Reservations', icon: 'pi pi-bookmark', command: () => router.push('/reservations') },
  { label: 'Reports', icon: 'pi pi-chart-bar', command: () => router.push('/reports') },
  { label: 'Categories', icon: 'pi pi-tags', command: () => router.push('/categories') },
  { label: 'Book Types', icon: 'pi pi-list', command: () => router.push('/book-types') },
  { label: 'Customers', icon: 'pi pi-user', command: () => router.push('/customers') },
  { label: 'Suppliers', icon: 'pi pi-truck', command: () => router.push('/suppliers') },
  ...(auth.isAdmin
    ? [{ label: 'Employees', icon: 'pi pi-users', command: () => router.push('/employees') }]
    : []),
]);

function logout() {
  auth.logout();
  router.replace('/login');
}
</script>

<template>
  <Menubar :model="items">
    <template #start>
      <span class="brand">📚 Bookstore</span>
    </template>
    <template #end>
      <span class="flex align-items-center gap-2" v-if="auth.user">
        <span>{{ auth.user.username }}</span>
        <Tag :value="auth.user.role" :severity="auth.isAdmin ? 'success' : 'info'" />
        <Button label="Logout" icon="pi pi-sign-out" size="small" severity="secondary" @click="logout" />
      </span>
    </template>
  </Menubar>

  <main class="page">
    <RouterView />
  </main>
</template>

<style scoped>
.brand {
  font-weight: 600;
  margin-right: 1rem;
}
.page {
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}
</style>

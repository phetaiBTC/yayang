<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Card from 'primevue/card';

const auth = useAuthStore();
const router = useRouter();

const tiles = [
  { label: 'Books', icon: 'pi pi-book', to: '/books' },
  { label: 'Purchasing', icon: 'pi pi-shopping-cart', to: '/purchase-orders' },
  { label: 'Imports', icon: 'pi pi-download', to: '/imports' },
  { label: 'Sales', icon: 'pi pi-dollar', to: '/sales' },
  { label: 'Reservations', icon: 'pi pi-bookmark', to: '/reservations' },
  { label: 'Reports', icon: 'pi pi-chart-bar', to: '/reports' },
  { label: 'Categories', icon: 'pi pi-tags', to: '/categories' },
  { label: 'Book Types', icon: 'pi pi-list', to: '/book-types' },
  { label: 'Customers', icon: 'pi pi-user', to: '/customers' },
  { label: 'Suppliers', icon: 'pi pi-truck', to: '/suppliers' },
];
</script>

<template>
  <section>
    <h1>ລະບົບຈັດການຮ້ານຂາຍປຶ້ມ</h1>
    <p>Welcome, <strong>{{ auth.user?.username }}</strong> ({{ auth.user?.role }}).</p>

    <div class="tiles">
      <Card v-for="t in tiles" :key="t.to" class="tile" @click="router.push(t.to)">
        <template #content>
          <i :class="t.icon" style="font-size: 1.6rem" />
          <div class="tile-label">{{ t.label }}</div>
        </template>
      </Card>
      <Card v-if="auth.isAdmin" class="tile" @click="router.push('/employees')">
        <template #content>
          <i class="pi pi-users" style="font-size: 1.6rem" />
          <div class="tile-label">Employees</div>
        </template>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}
.tile {
  cursor: pointer;
  text-align: center;
  transition: transform 0.1s ease;
}
.tile:hover {
  transform: translateY(-2px);
}
.tile-label {
  margin-top: 0.5rem;
  font-weight: 600;
}
</style>

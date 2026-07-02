<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const open = ref(false);

const items = computed(() => [
  { label: 'ໜ້າຫຼັກ', icon: 'pi pi-home', to: '/' },
  { label: 'ປຶ້ມ', icon: 'pi pi-book', to: '/books' },
  { label: 'ການສັ່ງຊື້', icon: 'pi pi-shopping-cart', to: '/purchase-orders' },
  { label: 'ການນຳເຂົ້າ', icon: 'pi pi-download', to: '/imports' },
  { label: 'ການຂາຍ', icon: 'pi pi-dollar', to: '/sales' },
  { label: 'ການຈອງ', icon: 'pi pi-bookmark', to: '/reservations' },
  { label: 'ລາຍງານ', icon: 'pi pi-chart-bar', to: '/reports' },
  { label: 'ໝວດໝູ່', icon: 'pi pi-tags', to: '/categories' },
  { label: 'ປະເພດປຶ້ມ', icon: 'pi pi-list', to: '/book-types' },
  { label: 'ລູກຄ້າ', icon: 'pi pi-user', to: '/customers' },
  { label: 'ຜູ້ສະໜອງ', icon: 'pi pi-truck', to: '/suppliers' },
  ...(auth.isAdmin
    ? [{ label: 'ພະນັກງານ', icon: 'pi pi-users', to: '/employees' }]
    : []),
]);

function logout() {
  auth.logout();
  router.replace('/login');
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ open }">
      <div class="brand">📚 ຮ້ານຂາຍປຶ້ມ</div>

      <nav class="nav">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="active"
          exact-active-class="active"
          @click="open = false"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer" v-if="auth.user">
        <div class="user">
          <span class="username">{{ auth.user.username }}</span>
          <Tag :value="auth.user.role" :severity="auth.isAdmin ? 'success' : 'info'" />
        </div>
        <Button
          label="ອອກຈາກລະບົບ"
          icon="pi pi-sign-out"
          size="small"
          severity="secondary"
          fluid
          @click="logout"
        />
      </div>
    </aside>

    <div class="backdrop" v-if="open" @click="open = false" />

    <div class="content">
      <div class="topbar">
        <Button
          class="menu-toggle"
          icon="pi pi-bars"
          text
          rounded
          aria-label="ເມນູ"
          @click="open = !open"
        />
        <span class="brand-mobile">📚 ຮ້ານຂາຍປຶ້ມ</span>
      </div>
      <main class="page">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100svh;
  text-align: left;
  background:
    radial-gradient(55% 45% at 85% 12%, rgba(253, 245, 200, 0.95), transparent 70%),
    radial-gradient(45% 40% at 12% 22%, rgba(190, 224, 210, 0.85), transparent 72%),
    radial-gradient(90% 55% at 50% 118%, rgba(120, 195, 180, 0.95), transparent 70%),
    linear-gradient(160deg, #c8e2d6 0%, #bfe0c4 34%, #dbe6a4 60%, #a3d6ca 100%);
  background-attachment: fixed;
}

.sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  width: 260px;
  flex: 0 0 260px;
  height: 100svh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  border-right: 1px solid var(--p-content-border-color, var(--border));
  background: var(--p-content-background, var(--bg));
}

.brand {
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.5rem 0.75rem 1rem;
  color: var(--text-h);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1 1 auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  color: var(--text);
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover {
  background: var(--p-content-hover-background, var(--accent-bg));
  color: var(--text-h);
}
.nav-item.active {
  background: var(--p-primary-color, var(--accent));
  color: var(--p-primary-contrast-color, #fff);
}
.nav-item i {
  width: 1.2rem;
  text-align: center;
}

.sidebar-footer {
  border-top: 1px solid var(--p-content-border-color, var(--border));
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.25rem;
}
.username {
  font-weight: 500;
  color: var(--text-h);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.page {
  padding: 1.5rem;
  flex: 1 1 auto;
}

.topbar {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--p-content-border-color, var(--border));
}
.brand-mobile {
  font-weight: 600;
}

.backdrop {
  display: none;
}

@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    z-index: 1100;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: var(--shadow);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .topbar {
    display: flex;
  }
  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1050;
    background: rgba(0, 0, 0, 0.4);
  }
}
</style>

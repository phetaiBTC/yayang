<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useAuthStore } from '../../stores/auth';
import { SHOP_NAME } from './shared';

const auth = useAuthStore();
const router = useRouter();

const nav = [
  { to: { name: 'my-account' }, label: 'ຮ້ານຄ້າ', icon: 'pi pi-shop' },
  { to: { name: 'my-purchases' }, label: 'ປະຫວັດການຊື້', icon: 'pi pi-history' },
  { to: { name: 'my-reservations' }, label: 'ການຈອງ', icon: 'pi pi-bookmark' },
];

function logout() {
  auth.logout();
  router.replace({ name: 'customer-login' });
}
</script>

<template>
  <main class="account-wrap">
    <div class="account-shell">
      <aside class="account-sidebar">
        <div class="brand">📚 {{ SHOP_NAME }}</div>

        <nav class="side-tabs">
          <RouterLink
            v-for="n in nav"
            :key="n.label"
            :to="n.to"
            class="side-tab"
            exact-active-class="active"
          >
            <i :class="n.icon" />
            <span>{{ n.label }}</span>
          </RouterLink>
        </nav>

        <div class="side-footer">
          <span class="hello">{{ auth.user?.username }}</span>
          <Button label="ອອກຈາກລະບົບ" icon="pi pi-sign-out" size="small" severity="secondary" fluid @click="logout" />
        </div>
      </aside>

      <section class="account-body">
        <RouterView />
      </section>
    </div>
  </main>
</template>

<style scoped>
.account-shell {
  display: flex;
  min-height: 100svh;
  align-items: stretch;
}
.account-sidebar {
  flex: 0 0 240px;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100svh;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  border-right: 1px solid var(--p-content-border-color, #e5e7eb);
  background: var(--p-content-background, var(--bg, #fff));
}
.brand {
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.5rem 0.75rem 1rem;
  color: var(--text-h);
}
.hello {
  color: var(--p-text-muted-color, #6b7280);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.side-footer {
  border-top: 1px solid var(--p-content-border-color, #e5e7eb);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.account-body {
  flex: 1 1 auto;
  min-width: 0;
  padding: 1.5rem;
  text-align: left;
}
.side-tabs {
  flex: 1 1 auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.side-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text, #6b7280);
  font-size: 0.95rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.side-tab:hover {
  background: var(--p-content-hover-background, rgba(0, 0, 0, 0.05));
  color: var(--text-h);
}
.side-tab.active {
  background: var(--p-primary-color, #63a80f);
  color: var(--p-primary-contrast-color, #fff);
}
.side-tab i {
  width: 1.2rem;
  text-align: center;
}

@media (max-width: 768px) {
  .account-shell {
    flex-direction: column;
  }
  .account-sidebar {
    flex: 0 0 auto;
    width: 100%;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--p-content-border-color, #e5e7eb);
  }
  .side-tabs {
    flex-direction: row;
    overflow-x: auto;
  }
  .side-footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

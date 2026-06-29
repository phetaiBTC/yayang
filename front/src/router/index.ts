import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/verify-otp',
    name: 'verify-otp',
    component: () => import('../views/OtpView.vue'),
  },
  {
    path: '/',
    component: () => import('../views/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      { path: 'books', name: 'books', component: () => import('../views/BooksView.vue') },
      {
        path: 'purchase-orders',
        name: 'purchase-orders',
        component: () => import('../views/PurchaseOrdersView.vue'),
      },
      {
        path: 'imports',
        name: 'imports',
        component: () => import('../views/ImportsView.vue'),
      },
      {
        path: 'sales',
        name: 'sales',
        component: () => import('../views/SalesView.vue'),
      },
      {
        path: 'reservations',
        name: 'reservations',
        component: () => import('../views/ReservationsView.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/ReportsView.vue'),
      },
      { path: 'categories', name: 'categories', component: () => import('../views/CategoriesView.vue') },
      { path: 'book-types', name: 'book-types', component: () => import('../views/BookTypesView.vue') },
      { path: 'customers', name: 'customers', component: () => import('../views/CustomersView.vue') },
      { path: 'suppliers', name: 'suppliers', component: () => import('../views/SuppliersView.vue') },
      {
        path: 'employees',
        name: 'employees',
        component: () => import('../views/EmployeesView.vue'),
        meta: { adminOnly: true },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth + role guard.
router.beforeEach((to) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' };
  }
  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'home' };
  }
});

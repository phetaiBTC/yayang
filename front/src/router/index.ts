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
    path: '/customer-login',
    name: 'customer-login',
    component: () => import('../views/CustomerLoginView.vue'),
  },
  {
    path: '/me',
    component: () => import('../views/customer/CustomerLayout.vue'),
    meta: { requiresAuth: true, customerOnly: true },
    children: [
      { path: '', name: 'my-account', component: () => import('../views/customer/ShopView.vue') },
      { path: 'purchases', name: 'my-purchases', component: () => import('../views/customer/PurchasesView.vue') },
      { path: 'reservations', name: 'my-reservations', component: () => import('../views/customer/ReservationsView.vue') },
    ],
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
  const customerOnly = to.matched.some((r) => r.meta.customerOnly);

  // Not signed in → send to the appropriate login for the area.
  if (requiresAuth && !auth.isAuthenticated) {
    const name = customerOnly ? 'customer-login' : 'login';
    return { name, query: { redirect: to.fullPath } };
  }
  // Signed-in users shouldn't sit on a login page.
  if ((to.name === 'login' || to.name === 'customer-login') && auth.isAuthenticated) {
    return auth.isCustomer ? { name: 'my-account' } : { name: 'home' };
  }
  // Keep customers out of the staff back-office…
  if (requiresAuth && !customerOnly && auth.isCustomer) {
    return { name: 'my-account' };
  }
  // …and employees out of the customer area.
  if (customerOnly && auth.isAuthenticated && !auth.isCustomer) {
    return { name: 'home' };
  }
  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'home' };
  }
});

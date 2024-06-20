import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import Dashboard from '../views/Dashboard.vue';
import ManageUsers from '../views/ManageUsers.vue';
import Packer from '../views/Packer.vue';
import OAuthCallback from '../views/OAuthCallback.vue';
import Loading from '../views/Loading.vue';
import { store } from '../store';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUpView,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiredRole: 'Manager' },
  },
  {
    path: '/manage-users',
    name: 'manage-users',
    component: ManageUsers,
    meta: { requiresAuth: true, requiredRole: 'Manager' },
  },
  {
    path: '/packer',
    name: 'packer',
    component: Packer,
    meta: { requiresAuth: true, requiredRole: 'Packer' },
  },
  {
    path: '/callback',
    name: 'callback',
    component: OAuthCallback,
  },
  {
    path: '/loading',
    name: 'loading',
    component: Loading,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!store.state.authChecked) {
    if (to.name !== 'loading') {
      next({ name: 'loading' });
      await store.dispatch('checkAuth');
      store.commit('setAuthChecked', true);
      next({ ...to, replace: true });
    } else {
      next();
    } 
  } else {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    if (requiresAuth) {
      if (!store.state.isAuthenticated) {
        next({ name: 'login' });
      } else if (store.state.userRole !== to.meta.requiredRole) {
        next({ name: 'home' });
      } else {
        next();
      }
    } else {
      next();
    }
  }
});

export default router;

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import OAuthCallback from '../views/OAuthCallback.vue'
import { supabase } from '@/supabase'

let localUser
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: () => import('../views/SignUpView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/manage-users',
      name: 'manage-users',
      component: () => import('../views/ManageUsers.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/packer',
      name: 'packer',
      component: () => import('../views/Packer.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/delivery-page',
      name: 'delivery-page',
      component: () => import('../views/DeliveryView.vue')
    },
    {
      path: '/callback',
      name: 'callback',
      component: OAuthCallback
    }
  ]
})
async function getUser(next) {
  localUser = await supabase.auth.getSession()
  console.log(localUser.data.session)
  if (localUser.data.session == null) {
    next('/')
  } else {
    next()
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    getUser(next)
  } else {
    next()
  }
})

export default router

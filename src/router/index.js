import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import SignUpView from '../views/SignUpView.vue'
import Dashboard from '../views/Dashboard.vue'
import ManageUsers from '../views/ManageUsers.vue'
import Packer from '../views/Packer.vue'
import OAuthCallback from '../views/OAuthCallback.vue'
import Loading from '../views/Loading.vue'
import DeliveryView from '@/views/DeliveryView.vue'
import { supabase } from '../supabase' // Assuming supabase is imported here

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUpView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiredRole: 'Manager' }
  },
  {
    path: '/manage-users',
    name: 'manage-users',
    component: ManageUsers,
    meta: { requiresAuth: true, requiredRole: 'Manager' }
  },
  {
    path: '/packer',
    name: 'packer',
    component: Packer,
    meta: { requiresAuth: true, requiredRole: 'Packer' }
  },
  {
    path: '/driver',
    name: 'driver',
    component: DeliveryView,
    meta: { requiresAuth: true, requiredRole: 'Driver' }
  },
  {
    path: '/callback',
    name: 'callback',
    component: OAuthCallback
  },
  {
    path: '/loading',
    name: 'loading',
    component: Loading
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

async function getUserSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching session:', error)
    return null
  }
  return data.session
}

async function getUserRole(email) {
  const { data, error } = await supabase.functions.invoke('core', {
    body: {
      type: 'checkRole',
      email: email
    }
  })
  if (error) {
    console.error('API Error:', error)
    return null
  }
  return data.data && data.data[0] ? data.data[0].Role : null
}

router.beforeEach(async (to, from, next) => {
  if (to.name === 'loading') {
    next()
    return
  }

  const session = await getUserSession()
  if (!session) {
    if (to.meta.requiresAuth) {
      next({ name: 'login' })
      return
    }
    next()
    return
  }

  const email = session.user.email
  const role = await getUserRole(email)

  if (to.meta.requiresAuth) {
    if (!session) {
      next({ name: 'login' })
      return
    }
    if (role !== to.meta.requiredRole) {
      next({ name: 'home' })
      return
    }
  } else {
    if (to.name === 'login' || to.name === 'SignUp') {
      if (role === 'Manager') {
        next({ name: 'dashboard' })
        return
      } else if (role === 'Packer') {
        next({ name: 'packer' })
        return
      } else if (role === 'Driver') {
        next({ name: 'driver' })
        return
      } else {
        next({ name: 'home' })
        return
      }
    }
  }
  next()
})

export default router

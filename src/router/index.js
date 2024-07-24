import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import SignUpView from '../views/SignUpView.vue'
import Dashboard from '../views/Dashboard.vue'
import ManageUsers from '../views/ManageUsers.vue'
import Packer from '../views/Packer.vue'
import OAuthCallback from '../views/OAuthCallback.vue'
import DeliveryView from '../views/DeliveryView.vue'
import Loading from '../views/Loading.vue'
import Inventory from '../views/Inventory.vue'
import Tracking from '../views/Tracking.vue'
import Shipments from '../views/Shipments.vue'

import { supabase } from '../supabase'

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
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: Inventory
  },
  {
    path: '/tracking',
    name: 'tracking',
    component: Tracking
  },
  {
    path: '/shipments',
    name: 'shipments',
    component: Shipments
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
  // console.log('Navigating to:', to.name)

  if (to.name === 'loading') {
    // console.log('Navigating to loading, proceeding without checks')
    next()
    return
  }

  const session = await getUserSession()
  // console.log('Session:', session)

  if (!session) {
    if (to.meta.requiresAuth) {
      // console.log('No session and route requires auth, redirecting to login')
      next({ name: 'login' })
      return
    }
    // console.log('No session and route does not require auth, proceeding')
    next()
    return
  }

  const email = session.user.email
  // console.log('User email:', email)

  const role = await getUserRole(email)
  // console.log('User role:', role)
  if (role === 'Manager') {
    next()
    return
  }
  if (to.meta.requiresAuth) {
    if (!session) {
      // console.log('Session not found, redirecting to login')
      next({ name: 'login' })
      return
    }
    if (role !== to.meta.requiredRole) {
      // console.log('Role does not match required role for route')
      // Redirect to the appropriate role-based page
      if (role === 'Manager') {
        // console.log('Redirecting to dashboard')
        next({ name: 'dashboard' })
        return
      } else if (role === 'Packer') {
        // console.log('Redirecting to packer')
        next({ name: 'packer' })
        return
      } else if (role === 'Driver') {
        // console.log('Redirecting to driver')
        next({ name: 'driver' })
        return
      } else {
        // console.log('Unknown role, redirecting to home')
        next({ name: 'home' })
        return
      }
    }
  } else {
    if (to.name === 'login' || to.name === 'SignUp') {
      if (role === 'Manager') {
        // console.log('Already logged in as Manager, redirecting to dashboard')
        next({ name: 'dashboard' })
        return
      } else if (role === 'Packer') {
        // console.log('Already logged in as Packer, redirecting to packer')
        next({ name: 'packer' })
        return
      } else if (role === 'Driver') {
        // console.log('Already logged in as Driver, redirecting to driver')
        next({ name: 'driver' })
        return
      } else {
        // console.log('Unknown role, redirecting to home')
        next({ name: 'home' })
        return
      }
    }
  }
  w
  // console.log('Proceeding to route')
  next()
})

export default router

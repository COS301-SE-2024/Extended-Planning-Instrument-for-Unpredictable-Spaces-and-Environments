<template>
  <Spinner></Spinner>
</template>

<script setup>
import Spinner from '../views/Loading.vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, computed } from 'vue'
import { useDark } from '@vueuse/core'
import LogoDarkTransparent from '@/assets/Photos/Logos/Logo-Dark-Transparent.svg'
import LogoLightTransparent from '@/assets/Photos/Logos/Logo-Light-Transparent.svg'

const isDark = useDark()

const router = useRouter()
let redirectTimer

async function handleOAuthCallback() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching session:', error)
    return
  }
  // console.log(data)
  if (data.session) {
    const user = data.session.user
    const email = user.user_metadata.email || user.email // Access email from user metadata or fallback to user.email
    await checkRole(email)
    return
  } else {
    console.error('No session found')
  }
}

async function checkRole(email) {
  const { data, error } = await supabase.functions.invoke('core', {
    body: {
      type: 'checkRole',
      email: email
    }
  })
  if (error) {
    console.error('API Error:', error)
    return
  }

  if (!data || !data.data || data.data.length === 0) {
    // console.error('Invalid data format:', data)
    // Set default role behavior if no role is found
    router.push({ name: 'home' })
    return
  }

  const role = data.data.Role
  console.log('OAuthCallback ', role)

  if (role === 'Driver') {
    // console.log('here boss')
    router.push({ name: 'driver' })
  } else if (role === 'Manager') {
    router.push({ name: 'dashboard' })
  } else if (role === 'Packer') {
    router.push({ name: 'packer' })
  } else {
    router.push({ name: 'home' })
  }
}
const logoSrc = computed(() => (isDark.value ? LogoLightTransparent : LogoDarkTransparent))

onMounted(() => {
  handleOAuthCallback()

  redirectTimer = setTimeout(() => {
    router.push({ name: 'error-404' })
  }, 10000)
})

onUnmounted(() => {
  if (redirectTimer) {
    clearTimeout(redirectTimer)
  }
})
</script>

<template>
  <div
    class="loading"
    :class="[isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-200 text-black']"
  >
    <img
      :src="
        isDark
          ? '/Members/Photos/Logos/Logo-Light-Transparent.svg'
          : '/Members/Photos/Logos/Logo-Dark-Transparent.svg'
      "
      class="logo"
      alt="Logo"
    />
    <ProgressSpinner
      style="width: 150px; height: 150px"
      strokeWidth="4"
      animationDuration=".5s"
      aria-label="Custom ProgressSpinner"
    />
  </div>
</template>

<script setup>
import ProgressSpinner from 'primevue/progressspinner'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useDark } from '@vueuse/core'
const isDark = useDark()

const router = useRouter()

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

onMounted(() => {
  handleOAuthCallback()
})
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.logo {
  width: 500px; /* Adjust size as needed */
  margin-bottom: 20px; /* Space between logo and spinner */
}

.ProgressSpinner {
  z-index: 2;
}

:deep(.p-progress-spinner-circle) {
  stroke: rgb(182, 119, 2) !important;
}
</style>

<template>
  <div class="loading">
    <ProgressSpinner />
  </div>
</template>

<script setup>
import ProgressSpinner from 'primevue/progressspinner'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

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
    console.error('Invalid data format:', data)
    // Set default role behavior if no role is found
    router.push({ name: 'home' })
    return
  }

  console.log('OAuthCallback ', data)
  const role = data.data[0].Role

  if (role === 'unassigned') {
    router.push({ name: 'home' })
  } else if (role === 'Manager') {
    router.push({ name: 'dashboard' })
  } else if (role === 'Packer') {
    router.push({ name: 'packer' })
  } else {
    router.push({ name: 'driver' })
  }
}

onMounted(() => {
  handleOAuthCallback()
})
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>

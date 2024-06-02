
<template>
    <ProgressSpinner />
  </template>
  
  <script setup>
  import ProgressSpinner from 'primevue/progressspinner';
  import { supabase } from '../supabase'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  // This function will be triggered when the component is mounted
  supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session)

      //router.push({ name: 'dashboard' })

})

  </script>
  
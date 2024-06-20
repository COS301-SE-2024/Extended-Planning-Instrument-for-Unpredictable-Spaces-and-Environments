<template>
    <div class="loading">
      <ProgressSpinner />
    </div>
  </template>
  
  <script setup>
  import ProgressSpinner from 'primevue/progressspinner';
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { store } from '../store';
  
  const router = useRouter();
  
  onMounted(async () => {
    await store.dispatch('checkAuth');
    if (store.state.isAuthenticated) {
      const role = store.state.userRole;
      if (role === 'Manager') {
        router.push({ name: 'dashboard' });
      } else if (role === 'Packer') {
        router.push({ name: 'packer' });
      } else {
        router.push({ name: 'home' });
      }
    } else {
      router.push({ name: 'login' });
    }
  });
  </script>
  
  <style scoped>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  </style>
  
<template>
    <div class="loading">
      <ProgressSpinner />
    </div>
  </template>
  
  <script setup>
  import ProgressSpinner from 'primevue/progressspinner';
  </script>
  
  <style scoped>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  </style>
  
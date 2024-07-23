<template>
  <div class="loading">
    <img src="/Members/Photos/Logos/Logo-Dark.svg" class="logo" alt="Logo" />
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
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgba(0, 0, 0, 1); /* Dim background */
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

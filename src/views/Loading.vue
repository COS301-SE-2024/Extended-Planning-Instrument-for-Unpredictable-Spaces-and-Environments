<template>
  <div
    class="loading"
    :class="[isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-200 text-black']"
  >
    <img
      :src="[
        isDark
          ? '../assets/Photos/Logos/Logo-Light-Transparent.svg'
          : '../assets/Photos/Logos/Logo-Dark-Transparent.svg'
      ]"
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
import { useDark } from '@vueuse/core'

const isDark = useDark()
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
  stroke: rgb(255, 136, 0) !important;
}
</style>

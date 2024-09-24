<template>
  <div
    class="loading"
    :class="[isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-200 text-black']"
  >
    <img :src="loadingIcon" class="logo" alt="Logo" />
    <Spinner
      style="width: 150px; height: 150px"
      strokeWidth="4"
      animationDuration=".5s"
      aria-label="Custom ProgressSpinner"
      :pt="{
        root: { style: 'width: 150px; height: 150px' },
        circle: { style: 'stroke: rgb(249, 115, 22);' }
      }"
    />
  </div>
</template>

<script setup>
import Spinner from 'primevue/progressspinner'
import { useDark } from '@vueuse/core'
import { getAssetURL } from '@/assetHelper'
import { computed } from 'vue'

const loadingIcon = computed(() =>
  isDark.value
    ? getAssetURL('Photos/Logos/Logo-Light-Transparent.svg')
    : getAssetURL('Photos/Logos/Logo-Dark-Transparent.svg')
)

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

/* Remove the :deep() selector as we're now using the pt prop */
</style>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
      :class="[
        'p-8 rounded-lg shadow-lg text-center',
        isDark ? 'bg-neutral-800 text-white' : 'bg-white text-black'
      ]"
    >
      <h2 class="text-2xl font-bold mb-4">Generating Packing Solution</h2>
      <div
        :class="[
          'w-full h-6 rounded-md overflow-hidden',
          isDark ? 'bg-neutral-700' : 'bg-gray-200'
        ]"
      >
        <div
          class="h-full bg-orange-500 transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="mt-2 text-lg font-semibold">{{ progress.toFixed(1) }}%</p>
      <p :class="['mt-2 text-sm', isDark ? 'text-gray-300' : 'text-gray-600']">
        {{ statusMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useDark } from '@vueuse/core'

defineProps<{
  show: boolean
  progress: number
  statusMessage: string
}>()

const isDark = useDark()
</script>

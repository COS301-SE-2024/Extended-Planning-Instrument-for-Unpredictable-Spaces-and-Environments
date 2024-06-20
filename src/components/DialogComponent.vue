<template>
  <Dialog :class="[isDark ? 'dark' : 'light', 'w-full max-w-2xl']" :visible="dialogVisible">
    <div @click="closeDialog" class="w-[5px] cursor-pointer items-left align-left">
      <Button
        icon="pi pi-times"
        iconPos="left"
        class="font-semibold p-button-text text-white p-2"
      />
    </div>
    <img class="mb-4" :src="imagePath" :alt="altText" />

    <div class="items-center align-center">
      <h2
        :class="[
          isDark ? 'text-white' : 'text-neutral-800',
          'mx-2 font-bold text-xl text-center mt-4'
        ]"
      >
        {{ title }}
      </h2>
      <template v-for="(person, index) in contacts" :key="index">
        <p
          :class="[
            isDark ? 'text-white' : 'text-neutral-800',
            'mx-2 text-center font-bold mt-2',
            person.underline ? 'underline' : ''
          ]"
        >
          {{ person.name }}
        </p>
        <p :class="[isDark ? 'text-white' : 'text-neutral-800', 'mx-2 text-center mt-2']">
          {{ person.phone }}
        </p>
      </template>
    </div>
  </Dialog>
</template>

<script setup>
import { useDark } from '@vueuse/core'

const isDark = useDark()

const emit = defineEmits(['close-dialog'])

const closeDialog = () => {
  console.log('CLOSING')
  emit('close-dialog')
}

// Props for dynamic content
const props = defineProps({
  imagePath: {
    type: String,
    required: true
  },
  altText: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  contacts: {
    type: Array,
    required: true
  },
  dialogVisible: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
/* Add your scoped styles here */
</style>

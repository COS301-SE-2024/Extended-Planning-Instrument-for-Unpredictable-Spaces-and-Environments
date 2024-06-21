<script setup>
import { useDark } from '@vueuse/core'
import Carousel from 'primevue/carousel'

const isDark = useDark()

const emit = defineEmits(['close-dialog'])

const closeDialog = () => {
  console.log('CLOSING')
  emit('close-dialog')
}

// Props for dynamic content
const props = defineProps({
  images: {
    type: Array,
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

<template>
  <Dialog :class="[isDark ? 'dark' : 'light', 'w-full max-w-2xl']" :visible="dialogVisible">
    <div @click="closeDialog" class="w-[5px] cursor-pointer items-left align-left">
      <Button
        icon="pi pi-times"
        iconPos="left"
        :class="[
          isDark ? 'text-red' : 'text-red',
          'my-4 bg-red-500 rounded-md font-semibold p-button-text p-2'
        ]"
      />
    </div>
    <Carousel
      :value="images"
      :numVisible="1"
      :numScroll="1"
      orientation="horizontal"
      containerClass="flex items-center"
    >
      <template #item="slotProps">
        <div class="rounded">
          <div class="relative mx-auto">
            <img :src="slotProps.data.src" :alt="slotProps.data.alt" class="w-full rounded" />
          </div>
        </div>
      </template>
    </Carousel>
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

<script setup>
import { useDark } from '@vueuse/core'
import { computed, ref } from 'vue'

const isDark = useDark()
const fullScreenImage = ref(null)

const emit = defineEmits(['close-dialog'])

const closeDialog = () => {
  emit('close-dialog')
}

const showFullScreen = (image) => {
  fullScreenImage.value = image
}

const closeFullScreen = () => {
  fullScreenImage.value = null
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

const dialogClass = computed(() => [
  isDark.value ? 'dark bg-gray-900' : 'light bg-gray-100',
  'w-full max-w-full md:max-w-5xl',
  'h-full md:h-auto md:max-h-[95vh]',
  'fixed inset-0 md:relative',
  'flex flex-col',
  'rounded-lg shadow-2xl'
])

const titleClass = computed(() => [
  isDark.value ? 'text-white' : 'text-gray-800',
  'font-bold text-2xl md:text-3xl',
  'mb-2 pb-2',
  'border-b-2',
  isDark.value ? 'border-gray-700' : 'border-gray-300'
])
</script>

<template>
  <Dialog :class="dialogClass" :visible="dialogVisible" :modal="true" :closable="false">
    <div class="flex justify-between items-center p-4 md:p-6">
      <h2 :class="titleClass">
        {{ title }}
      </h2>
      <Button
        @click="closeDialog"
        icon="pi pi-times"
        :class="[
          isDark ? 'text-gray-300 hover:text-white ' : 'text-gray-300 hover:text-gray-800',
          'p-button-rounded p-button-text bg-red-600',
          'transition-colors duration-200 text-lg'
        ]"
      />
    </div>
    <div class="flex-grow overflow-y-auto px-4 md:px-6 pb-4 md:pb-6">
      <div class="space-y-6 w-full">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="(image, index) in images"
            :key="index"
            class="relative group cursor-pointer"
            @click="showFullScreen(image)"
          >
            <img
              :src="image.src"
              :alt="image.alt"
              class="w-full h-40 object-cover rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            >
              <span class="text-white text-sm font-bold">View Full Screen</span>
            </div>
          </div>
        </div>
        <div class="w-full">
          <div
            class="bg-gradient-to-br from-orange-500 to-violet-900 rounded-lg p-4 md:p-6 shadow-lg"
          >
            <div class="flex items-center mb-4">
              <img
                src="../assets/Photos/truck.png"
                alt="Truck"
                class="w-16 h-16 mr-4 animate-bounce"
              />
              <div class="flex flex-col">
                <h3 class="text-white text-xl md:text-2xl font-bold mb-1">Get in Touch</h3>
                <p class="text-white text-sm md:text-base leading-tight">
                  Need a hand? We're here to help!
                </p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <template v-for="(person, index) in contacts" :key="index">
                <div
                  class="bg-white bg-opacity-20 rounded-lg p-4 transition-all duration-300 hover:bg-opacity-30 hover:shadow-md"
                >
                  <p class="text-white font-bold text-lg mb-2">
                    {{ person.name }}
                  </p>
                  <a
                    :href="
                      person.name === 'Call' ? `tel:${person.phone}` : `mailto:${person.phone}`
                    "
                    class="text-white text-sm md:text-base hover:text-yellow-300 transition-colors duration-200 flex items-center"
                  >
                    <i
                      :class="[
                        'pi',
                        person.name === 'Call' ? 'pi-phone' : 'pi-envelope',
                        'mr-2 text-white'
                      ]"
                    ></i>
                    <span class="text-white">{{ person.phone }}</span>
                  </a>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
  <Dialog
    v-if="fullScreenImage"
    :visible="!!fullScreenImage"
    :modal="true"
    :closable="false"
    class="p-0 m-0 w-screen h-screen flex items-center justify-center bg-black"
    :contentStyle="{ padding: '0', margin: '0', width: '100vw', height: '100vh' }"
  >
    <img
      :src="fullScreenImage.src"
      :alt="fullScreenImage.alt"
      class="max-w-full max-h-full w-full h-full object-contain"
    />
    <div class="absolute top-5 right-0 p-4 flex">
      <Button
        @click="closeFullScreen"
        icon="pi pi-times"
        class="bg-red-600 p-button-rounded p-button-text text-white hover:text-gray-300 transition-colors duration-200 text-3xl w-12 h-12 flex items-center justify-center"
      />
    </div>
  </Dialog>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style>

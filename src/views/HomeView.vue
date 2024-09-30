<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDark = useDark()
const videoRef = ref(null)
const isVideoLoaded = ref(false)

const changeUserRoute = () => {
  router.push({ name: 'callback' })
}

async function setupSubscription() {
  await supabase
    .channel('*')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Users' }, (payload) => {
      changeUserRoute()
    })
    .subscribe()
}

onMounted(() => {
  setupSubscription()

  if (videoRef.value) {
    videoRef.value.muted = true
    videoRef.value.addEventListener('loadeddata', () => {
      isVideoLoaded.value = true
      videoRef.value.play().catch((error) => {
        console.error('Error playing video:', error)
      })
    })
  }
})

const logout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  } else {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-950 text-white' : 'bg-gray-200 text-black',
      'flex flex-col lg:flex-row h-screen'
    ]"
  >
    <div class="video-container flex items-center justify-center w-full lg:w-1/2 lg:h-full">
      <link
        rel="preload"
        href="@/assets/Videos/truck-landing.mp4.mp4"
        as="video"
        type="video/mp4"
      />
      <video
        v-show="isVideoLoaded"
        ref="videoRef"
        src="@/assets/Videos/truck-landing.mp4.mp4"
        autoplay
        loop
        muted
        preload="auto"
        playsinline
        :class="['rounded-lg shadow-lg']"
        style="max-width: 100%; max-height: 100%"
      ></video>
      <div v-if="!isVideoLoaded" class="loading-placeholder">Loading...</div>
    </div>
    <div
      class="text-container flex flex-col items-center justify-center w-full lg:w-1/2 lg:h-full p-4 lg:p-8"
    >
      <div class="text-center lg:text-left">
        <p class="text-6xl font-bold mb-4 text-orange-600">Welcome</p>
        <p class="text-3xl lg:text-4xl font-bold mb-4">
          Your account is being set up, and you'll receive an activation confirmation soon.
        </p>
        <p class="text-base lg:text-2xl mb-4">
          Once activated, you'll have access to all features. Thank you for your patience!
        </p>
        <div class="flex justify-center lg:justify-start mt-6 lg:mt-10">
          <button @click="logout" class="bg-orange-600 text-white px-6 py-2 rounded-md">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

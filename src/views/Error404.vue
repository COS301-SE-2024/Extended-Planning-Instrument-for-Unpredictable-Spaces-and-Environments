<script setup>
import { useDark } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
// import { ref } from 'vue';

const router = useRouter()
const toast = useToast()
const isDark = useDark()
const activeIndex = ref(0)

// let session = await getUserSession()

const changeUserRoute = () => {
  router.push({ name: 'callback' })
}

async function setupSubscription() {
  await supabase // Await for the subscription to be established
    .channel('*')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Users' }, (payload) => {
      // console.log(payload.new)
      changeUserRoute()
    })
    .subscribe()
}

onMounted(() => {
  setupSubscription()

  const video = document.querySelector('video')
  if (video) {
    video.muted = true
    video.play().catch((error) => {
      console.error('Error playing video:', error)
    })
  }
})
const logout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  } else {
    router.push({ name: 'login' })
    // console.log('Log out successful')
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
      <video
        src="../assets/Videos/Error.mp4"
        autoplay
        loop
        muted
        :class="['rounded-lg shadow-lg']"
        style="max-width: 100%; max-height: 100%"
      ></video>
    </div>
    <div
      class="text-container flex flex-col items-center justify-center w-full lg:w-1/2 lg:h-full p-4 lg:p-8"
    >
      <div class="text-center lg:text-left">
        <p class="text-6xl font-bold mb-4 text-orange-600">404 Error</p>
        <p class="text-3xl lg:text-4xl font-bold mb-4">
          Oops! We seem to have lost your package in the matrix.
        </p>
        <p class="text-base lg:text-2xl mb-4">
          Looks like the boxes didn't stack up as planned. Our AI must have taken a coffee break!
          Let's get you back on track - no more missing parcels, we promise.
        </p>
        <div class="flex justify-center lg:justify-start mt-6 lg:mt-10">
          <button @click="logout" class="bg-orange-600 text-white px-6 py-2 rounded-md">
            Back to Safety!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

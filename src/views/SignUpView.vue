<script setup>
// import { useDark } from '@vueuse/core'
// const isDark = useDark()
// const toggleDark = () => {
//   isDark.value = !isDark.value
//   console.log('Dark mode:', isDark.value ? 'on' : 'off')
// }
</script>

<template>
  <div class="sign-up-view">
    <div class="welcome-section"></div>
    <SignUp />
  </div>
</template>

<script>
import SignUp from '@/components/SignUp.vue'

export default {
  components: {
    SignUp
  }
}
</script>

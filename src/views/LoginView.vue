<script setup>
// DARK MODE SETTINGS
import { useDark } from '@vueuse/core'
import { ref, computed, watchEffect, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'

// let localUser
const emailError = ref(false)
const passwordError = ref(false)
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}

// Authentication state
const email = ref('')
const password = ref('')
const router = useRouter()

const failedAttempts = ref(0)
const cooldownEndTime = ref(0)
const cooldownMessage = ref('')

// Computed property to check if the cooldown is active
const isCooldownActive = computed(() => {
  return Date.now() < cooldownEndTime.value
})

// Watch the cooldown end time and update the countdown message
watchEffect(() => {
  if (isCooldownActive.value) {
    const interval = setInterval(() => {
      const remainingTime = Math.ceil((cooldownEndTime.value - Date.now()) / 1000)
      cooldownMessage.value = `Too many failed attempts. Please wait ${Math.floor(remainingTime / 60)} minutes and ${remainingTime % 60} seconds before trying again.`

      if (!isCooldownActive.value) {
        clearInterval(interval)
      }
    }, 1000)
  } else {
    cooldownMessage.value = ''
  }
})

// Load the cooldownEndTime from localStorage when the component mounts
onMounted(() => {
  const storedCooldownEndTime = localStorage.getItem('cooldownEndTime')
  if (storedCooldownEndTime) {
    cooldownEndTime.value = parseInt(storedCooldownEndTime, 10)
  }
})

const signIn = async () => {
  const currentTime = Date.now()

  if (isCooldownActive.value) {
    return
  }

  if (failedAttempts.value >= 10) {
    alert("You have exceeded the maximum number of attempts. Please reset your password.")
    router.push({ name: 'forgot-password' }) // Redirect to password reset page
    return
  }

  const { user, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  
  if (error) {
    console.log(error)
    failedAttempts.value++
    
    if (error.message.includes('email')) {
      emailError.value = true
      passwordError.value = false
    } else if (error.message.includes('password')) {
      passwordError.value = true
      emailError.value = false
    } else {
      // If we can't determine which field is wrong, set both to true
      emailError.value = true
      passwordError.value = true
    }

    if (failedAttempts.value >= 3) {
      let cooldownMinutes = Math.pow(2, failedAttempts.value - 3) * 10
      cooldownEndTime.value = Date.now() + cooldownMinutes * 60000

      // Save the cooldownEndTime to localStorage
      localStorage.setItem('cooldownEndTime', cooldownEndTime.value.toString())
    }
    
    // You might want to set a more specific error message here
    console.error(error.message)
  } else {
    console.log('User signed in:', user)
    failedAttempts.value = 0 // Reset failed attempts on successful login

    // Clear the cooldownEndTime from localStorage on successful login
    localStorage.removeItem('cooldownEndTime')

    router.push({ name: 'callback' })
  }
}

// Sign in with OAuth provider
const signInWithProvider = async (provider) => {
  console.log(`signInWithProvider called with provider: ${provider}`)
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/callback`
    }
  })
  if (error) {
    alert(error.message)
  } else {
    // console.log(`Redirecting to ${provider} login page`)
    router.push({ name: 'callback' })

    // Do not navigate to the home page here, handle this in the callback
  }
}
</script>


<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900' : 'bg-gray-200',
      'min-h-screen flex flex-col items-center justify-center font-inter'
    ]"
  >
    <div
      :class="[
        isDark ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-800',
        'sign-in-container w-full h-screen sm:h-auto sm:w-[500px] mx-auto p-4 sm:p-14',
        'sm:rounded-xl sm:shadow-xl',
        'flex flex-col justify-center'
      ]"
    >
      <!-- Logo container -->
      <div
        :class="[
          'flex items-start justify-start w-full', // Align left on smaller screens
          'sm:items-center sm:justify-center' // Center on larger screens
        ]"
        style="margin-bottom: 1rem"
      >
        <img
          v-if="isDark"
          src="@/assets/Photos/Logos/Wording-Thin-Dark.svg"
          alt="Dark Mode Image"
          class="mb-10"
          style="width: 15rem; height: auto"
        />
        <img
          v-else
          src="@/assets/Photos/Logos/Wording-Thin-Light.svg"
          alt="Light Mode Image"
          class="mb-10"
          style="width: 15rem; height: auto"
        />
      </div>
      <div
        :class="[
          'flex flex-col w-full mb-6',
          'items-start justify-start text-left', // Align text left on smaller screens
          'sm:items-center sm:text-center' // Center text on larger screens
        ]"
      >
        <p class="text-3xl font-bold mb-2" :class="[isDark ? 'text-white' : 'text-neutral-800']">
          Welcome back!
        </p>
        <p class="mb-4" :class="[isDark ? 'text-gray-400' : 'text-neutral-800']">
          Please enter login details below
        </p>
      </div>
      <form @submit.prevent="signIn" class="flex flex-col">
        <div class="form-group mb-8">
          <label
            for="email"
            :class="[isDark ? 'text-white' : 'text-neutral-800', 'block font-bold']"
            >Email</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            required
            :class="[
              isDark
                ? 'text-white bg-neutral-900'
                : 'border border-neutral-900 bg-white text-neutral-800',
              'mt-2 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500'
            ]"
            @input="emailError = false"
            @blur="validateEmail"
          />
        </div>

        <label
          for="password"
          :class="[isDark ? 'text-white' : 'text-neutral-800', 'block font-bold']"
          >Password</label
        >

        <Password
          v-model="password"
          inputId="password"
          id="password"
          toggleMask
          required
          class="mt-2 w-full p-password"
          @input="passwordError = false"
          @blur="validatePassword"
        />
        <div v-if="passwordError || isCooldownActive" class="w-full bg-red-200 border-red-500 border-2 rounded-md mt-8">
          <p class="text-red-500 p-4">Incorrect email or password.</p>
          <p v-if="cooldownMessage" class="text-red-500 p-4">{{ cooldownMessage }}</p>
        </div>

        <router-link to="/forgot-password" class="mt-6 text-center text-md text-orange-500">
          Forgot Password ?</router-link
        >
        <button
          type="submit"
          class="my-6 sign-in-button w-full py-2 bg-orange-500 text-white rounded-lg text-lg font-semibold transition-transform duration-300 ease-in-out transform hover:translate-y-[-4px]"
          :disabled="isCooldownActive"
          :class="isCooldownActive ? 'opacity-50 cursor-not-allowed' : ''"
        >
          Sign In
        </button>
        <div class="flex items-center justify-center mb-6">
          <div :class="[isDark ? 'bg-neutral-500' : ' bg-neutral-800', '  h-0.5 w-[45%]']"></div>
          <p :class="[isDark ? 'text-white' : ' text-neutral-800 mx-2', 'mr-4 ml-4']">or</p>
          <div :class="[isDark ? 'bg-neutral-500' : ' bg-neutral-800', '  h-0.5 w-[45%]']"></div>
        </div>

        <div class="flex justify-center mb-8">
          <button
            data-provider="google"
            @click.prevent="signInWithProvider('google')"
            :class="[
              isDark
                ? ' bg-neutral-900'
                : 'text-neutral-800 bg-white shadow-sm border border-gray-300',
              'flex-grow w-[30%]  dark: h-14 rounded-lg mr-2 hover:transform hover:-translate-y-1 transition duration-300'
            ]"
          >
            <div class="flex items-center justify-center">
              <i class="pi pi-google"></i>
            </div>
          </button>
          <button
            data-provider="github"
            @click.prevent="signInWithProvider('github')"
            :class="[
              isDark
                ? ' bg-neutral-900'
                : 'text-neutral-800 bg-white shadow-sm border border-gray-300',
              'flex-grow w-[30%]  dark: h-14 rounded-lg mr-2 hover:transform hover:-translate-y-1 transition duration-300'
            ]"
          >
            <div class="flex items-center justify-center">
              <i class="pi pi-github"></i>
            </div>
          </button>
        </div>

        <p
          :class="[
            isDark ? 'text-white' : ' text-neutral-800 mx-2',
            'flex items-center justify-center mr-4 ml-4'
          ]"
        >
          Don't have an account ?
          <router-link to="/SignUp" class="ml-2 text-orange-500"> Sign up</router-link>
        </p>
      </form>
      <p
        @click="toggleDialog"
        class="mt-4 flex items-center justify-center text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
      >
        Help
      </p>
    </div>

    <div>
      <DialogComponent
        v-if="showDialog"
        imagePath="../assets/Photos/Login _ landing page.png"
        altText="Alternative Image"
        title="Contact Support"
        :contacts="[
          { name: 'Call', phone: '+27 12 345 6789', underline: true },
          { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
        ]"
        :dialogVisible="showDialog"
        @close-dialog="toggleDialog"
      />
    </div>
    <DialogComponent
      v-if="showDialog"
      :images="[
        { src: '../assets/Photos/Login _ landing page.png', alt: 'Image 1' },
        { src: '../assets/Photos/Sign-up.png', alt: 'Image 2' }
      ]"
      title="Help Menu"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
      :dialogVisible="showDialog"
      @close-dialog="toggleDialog"
    />
  </div>
</template>
<script>
export default {
  components: {
    DialogComponent
  }
}
const showDialog = ref(false)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.p-dialog-header {
  display: none;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
body {
  font-family: 'Inter', sans-serif;
}

.custom-icon-width {
  width: 50px; /* Adjust the width as needed */
}

/* Define specific styles for the Password component */
/* LIGHT MODE INPUT */

.p-password input {
  background-color: #262626;
  margin-top: 2px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  width: 90%;
  border-radius: 0.5rem;
  color: #000000;
  border: 1px solid #262626;
  background-color: white;
}
.p-password input:focus {
  outline: none;
  border-color: rgb(161 98 7);
  box-shadow: none;
}
.p-icon-field-right > .p-input-icon:last-of-type {
  right: 0rem;
  color: rgba(255, 255, 255, 0.6);
}
.p-password .p-password-toggle-icon {
  color: rgb(161 98 7);
  cursor: pointer;
}

.dark .p-password input {
  background-color: #171717;
  color: white;
  border: 1px solid #171717;
}

.specific-container .dark h1 {
  color: white !important;
  background-color: #262626 !important;
}

.dark .p-password input:focus {
  border-color: rgb(161 98 7);
}

.dark .p-password .p-password-toggle-icon {
  color: gray;
}
/* Light mode InputSwitch styles */
.p-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
  background-color: orange; /* Change this to your desired orange color */
}

.dark .p-dialog .p-dialog-content {
  background-color: #262626;
}
.dark .p-dialog .p-dialog-header {
  background-color: #262626;
}
.p-dialog .p-dialog-content {
  background: white;
}
.p-dialog .p-dialog-header {
  background: white;
}

input.border-red-500 {
  border-color: #ff0000 !important;
}
input.border-red-500:focus {
  border-color: #ff0000 !important;
  box-shadow: none;
}

/* Dark mode error styling */
.dark .border-red-500 {
  border-color: #ff0000 !important;
}

/* Error message styling */
.text-red-500 {
  color: #ff0000;
}

.p-password.password-error input {
  border: 2px solid #ff0000 !important;
}

.light .p-icon-field-right > .p-input-icon:last-of-type {
  right: 0rem;
  color: rgba(0, 0, 0, 0.6);
}

.dark .p-icon-field-right > .p-input-icon:last-of-type {
  right: 0rem;
  color: rgba(255, 255, 255, 0.6);
}
</style>

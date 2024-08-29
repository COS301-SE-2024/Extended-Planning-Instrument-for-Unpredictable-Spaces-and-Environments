<script setup>
import { useDark } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'
import { useToast } from 'primevue/usetoast'

const dialogVisible = ref(false)
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}
const password1 = ref('')
const password2 = ref('')
const email = ref('')
const router = useRouter()
const passwordError = ref(false)
const emailSent = ref(false)
const userEmail = ref('')
const userToken = ref('')
const toast = useToast()

const passwordsMatch = computed(() => password1.value === password2.value)

const isValidPassword = computed(() => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  return passwordRegex.test(password1.value)
})

// Function to handle password update
const resetPassword = async () => {
  if (!passwordsMatch.value) {
    passwordError.value = true
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Passwords do not match. Please try again.',
      life: 3000
    })
    return
  }

  if (!isValidPassword.value) {
    passwordError.value = true
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        'Password must be at least 8 characters long and include one lowercase, one uppercase, and one numeric character.',
      life: 3000
    })
    return
  }

  passwordError.value = false

  try {
    const { error } = await supabase.auth.updateUser({
      email: userEmail.value,
      password: password1.value
    })

    if (error) {
      console.error('Error updating password:', error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating password: ' + error.message,
        life: 3000
      })
    } else {
      await supabase.auth.signOut()
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Password updated successfully.',
        life: 3000
      })
      router.push('/')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unexpected error occurred: ' + error.message,
      life: 3000
    })
  }
}

const route = useRoute()
onMounted(() => {
  const { email, token } = route.query
  if (email && token) {
    userEmail.value = email
    userToken.value = token
  }
})
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
          src="/Members/Photos/Logos/Wording-Thin-Dark.svg"
          alt="Dark Mode Image"
          class="mb-10"
          style="width: 15rem; height: auto"
        />
        <img
          v-else
          src="/Members/Photos/Logos/Wording-Thin-Light.svg"
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
          Change Password
        </p>
        <p class="mb-4" :class="[isDark ? 'text-gray-400' : 'text-neutral-800']">
          Please enter your new passwrod below
        </p>
      </div>
      <form @submit.prevent="resetPassword" class="flex flex-col">
        <label
          for="password1"
          :class="[isDark ? 'text-white ' : ' text-neutral-800', 'block font-bold']"
          >Password</label
        >

        <Password
          inputId="password1"
          id="password1"
          v-model="password1"
          toggleMask
          :invalid="password1 === ''"
          required
          :class="[
            !isDark ? 'text-white' : 'text-neutral-800',
            'focus:ring-0 hover:ring-0 mb-6 mt-2'
          ]"
        >
          <template #header>
            <h6>Pick a password</h6>
          </template>
          <template #footer>
            <Divider />
            <p class="rounded-lg mt-2">Suggestions</p>
            <ul class="rounded-lg pl-2 ml-2 mt-0" style="line-height: 1.5">
              <li>At least one lowercase</li>
              <li>At least one uppercase</li>
              <li>At least one numeric</li>
              <li>Minimum 8 characters</li>
            </ul>
          </template>
        </Password>
        <p v-if="passwordError" class="text-red-500 text-sm mt-2 mb-4">
          Password must be at least 8 characters long and include one lowercase, one uppercase, and
          one numeric character.
        </p>
        <label
          for="password2"
          :class="[isDark ? 'text-white ' : ' text-neutral-800', 'block font-bold ']"
          >Confirm Password</label
        >
        <Password
          inputId="password2"
          id="password2"
          v-model="password2"
          toggleMask
          :invalid="!passwordsMatch && password2 !== ''"
          required
          :class="[
            !isDark ? 'text-white' : 'text-neutral-800',
            'focus:ring-0 hover:ring-0 mt-2 mb-8 '
          ]"
        >
          <template #header>
            <h6>Pick a password</h6>
          </template>
          <template #footer>
            <Divider />
            <p class="rounded-lg mt-2">Suggestions</p>
            <ul class="rounded-lg pl-2 ml-2 mt-0" style="line-height: 1.5">
              <li>At least one lowercase</li>
              <li>At least one uppercase</li>
              <li>At least one numeric</li>
              <li>Minimum 8 characters</li>
            </ul>
          </template>
        </Password>

        <p v-if="!passwordsMatch && password2" class="text-red-500 mb-4">Passwords do not match</p>
        <button
          type="submit"
          :disabled="!passwordsMatch || !isValidPassword"
          :class="[
            'mb-6 sign-in-button w-full py-2 bg-orange-500 text-white rounded-lg text-lg font-semibold transition duration-300',
            passwordsMatch && isValidPassword
              ? 'hover:transform hover:-translate-y-1'
              : 'opacity-50 cursor-not-allowed'
          ]"
        >
          Change Password
        </button>
        <p
          :class="[
            isDark ? 'text-white' : ' text-neutral-800 mx-2',
            'flex items-center justify-center mr-4 ml-4'
          ]"
        >
          <router-link to="/" class="ml-2 text-orange-500"> Back to login</router-link>
        </p>
        <p
          @click="toggleDialog"
          class="mt-4 flex items-center justify-center text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
        >
          Help
        </p>
      </form>
    </div>

    <div>
      <DialogComponent
        v-if="dialogVisible"
        imagePath="/Members/Photos/Login _ landing page.png"
        altText="Alternative Image"
        title="Help Menu"
        :contacts="[
          { name: 'Call', phone: '+27 12 345 6789', underline: true },
          { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
        ]"
        :dialogVisible="dialogVisible"
        @close-dialog="toggleDialog"
      />
    </div>
    <DialogComponent
      v-if="dialogVisible"
      :images="[
        { src: '/Members/Photos/Login _ landing page.png', alt: 'Image 1' },
        { src: '/Members/Photos/Sign-up.png', alt: 'Image 2' }
      ]"
      title="Help Menu"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
      :dialogVisible="dialogVisible"
      @close-dialog="toggleDialog"
    />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.p-dialog .p-dialog-header-icon {
  display: none;
}
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

.p-icon-field-right > .p-input-icon:last-of-type {
  right: 0rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>

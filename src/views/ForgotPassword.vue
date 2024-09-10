<script setup>
import { useDark } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'
import { useToast } from 'primevue/usetoast'
import { checkUserExistsByEmail } from '../../supabase/functions/core/Users/checkUserExistsByEmail'

const dialogVisible = ref(false)
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}

const toggleDialog = () => {
  dialogVisible.value = !dialogVisible.value
}

const password1 = ref('')
const password2 = ref('')
const email = ref('')
const router = useRouter()
const passwordError = ref(false)
const emailSent = ref(false)
const userEmail = ref('')
const userToken = ref('')
const toast = useToast() // <-- Use the toast hook

const passwordsMatch = computed(() => password1.value === password2.value)

const isValidPassword = computed(() => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  return passwordRegex.test(password1.value)
})

const showSuccess = () => {
  toast.add({ severity: 'success', summary: 'Success', detail: 'Recovery email sent', life: 3000 })
}

const showError = () => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Error sending password recovery email',
    life: 3000
  })
}

const requestPasswordReset = async () => {
  if (!passwordsMatch.value) {
    passwordError.value = true
    alert('Passwords do not match. Please try again.')
    return
  }

  passwordError.value = false

  try {
    // Check if the email exists using the new API call
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'checkUserExistsByEmail',
        email: email.value
      }),
      method: 'POST'
    })
    // console.log('DATATA', data.exists)

    if (error || !data.exists) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'An Account with this Email Does not exist. Please check the email address or Sign Up with an Account.',
        life: 3000
      })
      return
    }
    // Email exists, proceed with password reset
    const { resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/confirm-password`
    })

    if (resetError) {
      showError()
      console.error('Error sending password recovery email:', resetError)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `Unexpected Error when sending password recovery email ${resetError.message}`,
        life: 3000
      })
      return
    } else {
      showSuccess()
      emailSent.value = true
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Unexpected Error when sending password recovery email ${error.message}`,
      life: 3000
    })
  }
}

// Function to handle password update
const resetPassword = async () => {
  if (!passwordsMatch.value) {
    passwordError.value = true
    alert('Passwords do not match. Please try again.')
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
      alert('Error updating password: ' + error.message)
    } else {
      alert('Password updated successfully.')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    alert('Unexpected error occurred: ' + error.message)
  }
}

const route = useRoute()
onMounted(() => {
  const { email, token } = route.query
  if (email && token) {
    userEmail.value = email
    userToken.value = token
    resetPassword()
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
          Forgot Password?
        </p>
        <p class="mb-4" :class="[isDark ? 'text-gray-400' : 'text-neutral-800']">
          Enter you email to receive a recovery link
        </p>
      </div>

      <h2 class="mb-2 text-gray-500 dark:text-gray-400 text-left"></h2>
      <form @submit.prevent="requestPasswordReset" class="flex flex-col">
        <div class="form-group mb-6">
          <label
            for="email"
            :class="[isDark ? 'text-white' : ' text-neutral-800', 'block font-bold']"
            >Email</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            required
            :class="[
              isDark
                ? 'text-white  bg-neutral-900'
                : 'border border-neutral-900 bg-white text-neutral-800',
              'mt-2 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500'
            ]"
          />
        </div>
        <button
          type="submit"
          :class="[
            'mb-6 sign-in-button w-full py-2 bg-orange-500 text-white rounded-lg text-lg font-semibold transition duration-300',
            'hover:transform hover:-translate-y-1'
          ]"
        >
          Recover Account
        </button>

        <Toast />

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
        :images="[
          { src: '../assets/Photos/Help/LoginSignup/1.png', alt: 'Image 1' },
          { src: '../assets/Photos/Help/LoginSignup/2.png', alt: 'Image 2' },
          { src: '../assets/Photos/Help/LoginSignup/3.png', alt: 'Image 3' },
          { src: '../assets/Photos/Help/LoginSignup/4.png', alt: 'Image 4' },
          { src: '../assets/Photos/Help/LoginSignup/5.png', alt: 'Image 5' }
        ]"
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
</style>

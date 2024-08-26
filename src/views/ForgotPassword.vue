<script setup>
import { useDark } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter, useRoute } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'
import { useToast } from 'primevue/usetoast'
import { checkUserExistsByEmail } from '../../supabase/functions/core/Users/checkUserExistsByEmail';

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
    passwordError.value = true;
    alert('Passwords do not match. Please try again.');
    return;
  }

  passwordError.value = false;

  try {
    // Check if the email exists using the new API call
    const { exists, error: emailError } = await checkUserExistsByEmail(supabase, email.value);

    if (emailError || !exists) {
      // If there's an error or no user is found, show an error message
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Email not found. Please check the email address and try again.',
        life: 3000,
      });
      return; // Exit the function since the email is not valid
    }

    // Email exists, proceed with password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/confirm-password`,
    });

    if (error) {
      showError();
      console.error('Error sending password recovery email:', error);
      alert('Error sending password recovery email: ' + error.message);
    } else {
      showSuccess();
      emailSent.value = true;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('Unexpected error occurred: ' + error.message);
  }
};


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
      isDark ? 'dark bg-neutral-900' : 'bg-gray-100',
      'min-h-screen flex flex-col items-center justify-center shadow-lg font-inter px-4'
    ]"
  >
    <div
      :class="[
        isDark ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-800',
        'mt-4 sign-in-container w-full sm:w-[500px] h-auto mx-auto p-8 sm:p-14 rounded-xl shadow-xl'
      ]"
    >
      <div class="flex items-center justify-center">
        <img
          v-if="isDark"
          src="@/assets/Photos/Logos/Wording-Thin-Dark.svg"
          alt="Dark Mode Image"
          class="mb-10"
          style="width: 10rem; height: auto"
        />
        <img
          v-else
          src="@/assets/Photos/Logos/Wording-Thin-Light.svg"
          alt="Light Mode Image"
          class="mb-10"
          style="width: 10rem; height: auto"
        />
      </div>
      <p
        :class="[
          isDark ? 'text-white' : ' text-neutral-800 ',
          'text-3xl flex items-center font-bold mb-2 '
        ]"
      >
        Forgot Password?
      </p>
      <h2 class="mb-8 text-gray-500 dark:text-gray-400 text-left">
        Enter you email to receive a recovery link
      </h2>
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
      </form>
    </div>
    <div class="flex-col">
      <div
        @click="toggleDark"
        :class="[
          isDark ? 'bg-neutral-800' : 'text-neutral-800 bg-white shadow-sm border border-gray-300',
          'w-[200px] cursor-pointer h-[auto] rounded-lg py-4 mt-6 mb-4 flex flex-row items-center justify-center hover:-translate-y-1 transition duration-300'
        ]"
      >
        <p :class="['mr-4', 'text-left', isDark ? 'text-white' : 'text-neutral-800']">
          <span v-if="isDark">Light Mode</span>
          <span v-else>Dark Mode</span>
        </p>

        <button class="focus:outline-none">
          <i :class="[isDark ? 'pi pi-sun' : 'pi pi-moon', 'text-xl']"></i>
        </button>
      </div>

      <p
        @click="toggleDialog"
        class="flex items-center justify-center mr-4 text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
      >
        Help
      </p>
    </div>

    <div>
      <DialogComponent
        v-if="dialogVisible"
        imagePath="src/assets/Photos/Login _ landing page.png"
        altText="Alternative Image"
        title="Contact Support"
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
        { src: '@/assets/Photos/Login _ landing page.png', alt: 'Image 1' },
        { src: '@/assets/Photos/Sign-up.png', alt: 'Image 2' }
        // Add more images as needed
      ]"
      title="Contact Support"
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

<script setup>
import { useDark } from '@vueuse/core'
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'

const dialogVisible = ref(false)
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}

const email = ref('')
const router = useRouter()

// Function to handle password recovery
const recoverPassword = async () => {
  const { data, error: fetchError } = await supabase
    .from('Users')
    .select('Email')
    .eq('Email', email.value)

  if (fetchError) {
    alert('Error checking email: ' + fetchError.message)
    return
  }

  if (data.length === 0) {
    alert('Email not found in the database')
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/callback`, // Change this URL as per your routing setup
  })

  if (error) {
    alert('Error sending password recovery email: ' + error.message)
  } else {
    alert('Password recovery email sent.')
    router.push({ name: 'login' }) // Redirect to login page or any other page after sending the email
  }
}

const toggleDialog = () => {
  dialogVisible.value = !dialogVisible.value
}
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
          src="/Members/Photos/Logos/Wording-Thin-Dark.svg"
          alt="Dark Mode Image"
          class="mb-10"
          style="width: 10rem; height: auto"
        />
        <img
          v-else
          src="/Members/Photos/Logos/Wording-Thin-Light.svg"
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
      <h2 class="mb-8 text-gray-500 dark:text-gray-400 text-left">Enter your email address</h2>
      <form @submit.prevent="recoverPassword" class="flex flex-col">
        <div class="form-group mb-8">
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
          class="mb-6 sign-in-button w-full py-2 bg-orange-500 text-white rounded-lg text-lg font-semibold hover:transform hover:-translate-y-1 transition duration-300"
        >
          Recover Password
        </button>
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
        imagePath="/Members/Photos/Login _ landing page.png"
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
        { src: '/Members/Photos/Login _ landing page.png', alt: 'Image 1' },
        { src: '/Members/Photos/Sign-up.png', alt: 'Image 2' }
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
</style>

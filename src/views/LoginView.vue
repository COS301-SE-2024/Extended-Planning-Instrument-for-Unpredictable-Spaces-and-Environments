<script setup>
// DARK MODE SETTINGS
import { useDark } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'

// let localUser
const dialogVisible = ref(false)

const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}

// Authentication state
const email = ref('')
const password = ref('')
const router = useRouter()

// Sign in with email and password
const signIn = async () => {
  const { user, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  if (error) {
    alert(error.message)
  } else {
    console.log('User signed in:', user)
    // await checkRole()
    router.push({ name: 'callback' })
  }
}

// Sign in with OAuth provider
const signInWithProvider = async (provider) => {
  console.log(`signInWithProvider called with provider: ${provider}`);
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/callback`
    }
  });
  if (error) {
    alert(error.message);
  } else {
    console.log(`Redirecting to ${provider} login page`)
    router.push({ name: 'callback' })

    // Do not navigate to the home page here, handle this in the callback
  }
};

</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900' : 'bg-gray-100',
      ' min-h-screen flex flex-col items-center justify-center shadow-lg font-inter px-4'
    ]"
  >
    <div
      :class="[
        isDark ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-800',
        'mt-4 sign-in-container w-full sm:w-[500px] h-auto mx-auto p-8 sm:p-14 rounded-xl shadow-xl'
      ]"
    >
      <i
        :class="[isDark ? 'text-neutral-300' : 'text-neutral-700', 'mb-6 pi pi-truck']"
        style="font-size: 2rem"
      ></i>
      <h1
        :class="[
          isDark ? 'dark text-white' : 'text-neutral-800',
          'mb-2 text-left text-3xl font-normal'
        ]"
      >
        Sign in to Janeeb Solutions
      </h1>
      <h2 class="mb-10 text-neutral-700 dark:text-neutral-400 text-left">
        Streamlined Cargo Solutions
      </h2>

      <form @submit.prevent="signIn" class="flex flex-col">
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
              'mt-2  form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-yellow-600'
            ]"
          />
        </div>

        <label
          for="password"
          :class="[isDark ? 'text-white ' : ' text-neutral-800', 'block font-bold']"
          >Password</label
        >
        <Password
          id="password"
          v-model="password"
          toggleMask
          required
          :feedback="false"
          :class="[
            !isDark ? 'text-white' : 'text-neutral-800',
            'focus:ring-0 hover:ring-0 mb-8 mt-2'
          ]"
        />
        <button
          type="submit"
          class="mb-6 sign-in-button w-full py-2 bg-yellow-700 text-white rounded-lg text-lg font-semibold hover:transform hover:-translate-y-1 transition duration-300"
        >
          Sign In
        </button>
        <div class="flex items-center justify-center mb-6">
          <div :class="[isDark ? 'bg-neutral-500' : ' bg-neutral-800', '  h-0.5 w-[45%]']"></div>
          <p :class="[isDark ? 'text-white' : ' text-neutral-800 mx-2', 'mr-4 ml-4']">or</p>
          <div :class="[isDark ? 'bg-neutral-500' : ' bg-neutral-800', '  h-0.5 w-[45%]']"></div>
        </div>

        <div class="flex justify-center mb-8">
          <button data-provider="google"
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
          <button data-provider="github"
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
          <router-link to="/SignUp" class="ml-2 text-yellow-600"> Sign up</router-link>
        </p>
      </form>
    </div>
    <div class="flex-col">
      <div
        @click="toggleDark"
        :class="[
          isDark ? 'bg-neutral-800' : 'text-neutral-800 bg-white shadow-sm border border-gray-300',
          'hover:transform hover:-translate-y-1 transition duration-300 mb-4 w-[200px] cursor-pointer h-[auto] rounded-lg py-4 mt-8 flex flex-row items-center justify-center'
        ]"
      >
        <p class="mr-4 text-gray-500 dark:text-gray-400 text-left">Dark Mode Toggle</p>
        <button class="focus:outline-none">
          <i :class="[isDark ? 'pi pi-moon' : 'pi pi-sun', 'text-xl']"></i>
        </button>
      </div>

      <p
        @click="toggleDialog"
        class="flex items-center justify-center mr-4 text-yellow-600 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
      >
        Help
      </p>
    </div>

    <div>
      <DialogComponent
        v-if="showDialog"
        imagePath="/Members/Photos/Login _ landing page.png"
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
        { src: '/Members/Photos/Login _ landing page.png', alt: 'Image 1' },
        { src: '/Members/Photos/Sign-up.png', alt: 'Image 2' }
        // Add more images as needed
      ]"
      title="Contact Support"
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

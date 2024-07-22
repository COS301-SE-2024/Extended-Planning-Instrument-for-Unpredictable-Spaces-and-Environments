<script setup>
import { ref } from 'vue'
import { useDark } from '@vueuse/core'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'
const dialogVisible = ref(false)

const isDark = useDark()
const router = useRouter()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}

const name = ref('')
const number = ref('')
const email = ref('')
const password = ref('')

const signUp = async () => {
  try {
    console.log(email.value)
    console.log(password.value)
    const { user, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) {
      alert(error.message)
    } else {
      console.log('User signed up:', user)
      alert('Sign up successful!')
      const { data, error } = await supabase.functions.invoke('core', {
        body: {
          type: 'insertUser',
          fullname: name.value,
          email: email.value,
          role: 'unassigned',
          phone: number.value
        }
      })
      console.log(name.value, email.value, number.value)
      // console.log('This is data.data ' + data.data);
      if (error) {
        console.log('API Error:', error)
      } else {
        // console.log("you are reaching here")
        router.push({ name: 'home' })
      }
    }
  } catch (error) {
    console.error('Error signing up:', error)
    alert('Error signing up.')
  }
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
      <i
        :class="[isDark ? 'text-neutral-300' : 'text-neutral-800', 'mb-6 pi pi-truck']"
        style="font-size: 2rem"
      ></i>
      <h1
        :class="[
          isDark ? 'dark text-white' : 'text-neutral-800',
          'mb-2 text-left text-3xl font-normal'
        ]"
      >
        Create a new account
      </h1>
      <h2 class="mb-10 text-gray-500 dark:text-gray-400 text-left">
        Join us and revolutionize logistics efficiency.
      </h2>

      <form @submit.prevent="signUp" class="sign-up-form">
        <div class="form-group">
          <label for="name" :class="[isDark ? 'text-white' : 'text-neutral-900', 'block font-bold']"
            >First Name</label
          >
          <input
            :class="[
              isDark
                ? 'text-white border bg-neutral-900 border-transparent'
                : 'border border-neutral-900 bg-white text-neutral-800',
              'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500'
            ]"
            type="text"
            id="name"
            v-model="name"
            required
            placeholder="eg. John"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label
            for="number"
            :class="[isDark ? 'text-white' : 'text-neutral-900', 'block font-bold']"
            >Phone Number</label
          >
          <input
            :class="[
              isDark
                ? 'text-white border bg-neutral-900 border-transparent'
                : 'border border-neutral-900 bg-white text-neutral-800',
              'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500'
            ]"
            type="text"
            id="number"
            v-model="number"
            required
            placeholder="eg. 27826180677"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label
            for="email"
            :class="[isDark ? 'text-white' : 'text-neutral-900', 'block font-bold']"
            >Email</label
          >
          <input
            :class="[
              isDark
                ? 'text-white border bg-neutral-900 border-transparent'
                : 'border border-neutral-900 bg-white text-neutral-800',
              'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500'
            ]"
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="example@example.com"
            class="form-control"
          />
        </div>
        <div class="form-group w-full">
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
            class="w-full p-password"
            :class="[!isDark ? 'text-black bg-white' : '', 'focus:ring-0 hover:ring-0 mb-8 mt-2']"
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

          <button
            type="submit"
            class="mb-6 sign-in-button w-full py-2 bg-orange-500 text-white rounded-lg text-lg font-semibold hover:transform hover:-translate-y-1 transition duration-300"
          >
            Create new account
          </button>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-center">
          Already have an account?
          <router-link to="/" class="text-orange-500">Login</router-link>
        </p>
      </form>
    </div>
    <div
      @click="toggleDark"
      :class="[
        isDark ? 'text-white bg-neutral-800' : 'text-neutral-800 bg-white shadow-sm',
        'w-[200px] cursor-pointer h-[auto] rounded-lg py-4 mt-8 flex flex-row items-center justify-center'
      ]"
    >
      <p :class="[isDark ? 'text-white text-left mr-4' : 'text-neutral-800 mr-4']">
        Dark Mode Toggle
      </p>

      <button class="focus:outline-none">
        <i :class="[isDark ? 'pi pi-moon' : 'pi pi-sun', 'text-xl']"></i>
      </button>
    </div>
    <p
      @click="toggleDialog"
      class="mt-4 flex items-center justify-center text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
    >
      Help
    </p>
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
@import url('https://fonts.googleapis.com/css2?family=SF+Compact&display=swap');

.font-sf-compact {
  font-family: 'SF Compact', sans-serif;
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
/* Light mode footer text color */
.p-password-footer p,
.p-password-footer ul li {
  color: #6b7280; /* Replace with your desired light mode text color */
}

/* Dark mode footer text color */
.dark .p-password-footer p,
.dark .p-password-footer ul li {
  color: #0066ff; /* Replace with your desired dark mode text color */
}
</style>

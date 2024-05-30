<script setup>
import { ref } from 'vue';
import { useDark } from '@vueuse/core'
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}
const name = ref('');
const number = ref('');
const email = ref('');
const password = ref('');
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-zinc-900' : 'bg-gray-100',
      'min-h-screen flex flex-col items-center justify-center shadow-lg'
    ]"
  >
    <div
      :class="[
        isDark ? 'bg-zinc-800' : 'bg-white',
        'sign-in-container w-[500px] h-auto mx-auto  p-14  rounded-xl shadow-xl font-sf-compact'
      ]"
    >
      <i
        :class="[isDark ? 'text-zinc-300' : 'text-zinc-800', 'mb-6 pi pi-truck']"
        style="font-size: 2rem"
      ></i>
      <h1
        :class="[
          isDark ? 'dark text-white' : 'text-zinc-800',
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
          <label for="name" :class="[isDark ? 'text-white' : 'text-zinc-900', 'block font-bold']"
            >First Name</label
          >
          <input
            :class="[
              isDark
                ? 'text-white border-gray-500 bg-zinc-900'
                : 'border border-gray-300 bg-white text-zinc-800',
              'mt-2 mb-6 form-control w-full px-3 py-2 border   rounded-lg   focus:outline-none  focus:border-yellow-600'
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
          <label for="name" :class="[isDark ? 'text-white' : 'text-zinc-900', 'block font-bold']"
            >Phone Number</label
          >
          <input
            :class="[
              isDark
                ? 'text-white border-gray-500 bg-zinc-900'
                : 'border border-gray-300 bg-white text-zinc-800',
              'mt-2 mb-6 form-control w-full px-3 py-2 border   rounded-lg   focus:outline-none  focus:border-yellow-600'
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
          <label for="email" :class="[isDark ? 'text-white' : 'text-zinc-900', 'block font-bold']"
            >Email</label
          >
          <input
            :class="[
              isDark
                ? 'text-white border-gray-500 bg-zinc-900'
                : 'border border-gray-300 bg-white text-zinc-800',
              'mt-2 mb-6 form-control w-full px-3 py-2 border   rounded-lg   focus:outline-none  focus:border-yellow-600'
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
            :class="[isDark ? 'text-white' : 'text-zinc-800', 'block font-bold']"
            >Password</label
          >

          <Password
            v-model="password"
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
            class="mb-6 sign-in-button w-full py-2 bg-yellow-600 text-white rounded-lg text-lg font-semibold hover:transform hover:-translate-y-1 transition duration-300"
          >
            Create new account
            <!-- <div :class="[isDark ? '' : '',  -->
          </button>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-center">
          Already have an account ?
          <router-link to="/" class="text-yellow-600">Login</router-link>
        </p>
      </form>
    </div>
    <div
      @click="toggleDark"
      :class="[
        isDark ? 'bg-zinc-800' : 'text-zinc-800 bg-white shadow-sm border border-gray-300',
        'w-[200px] cursor-pointer h-[auto] rounded-lg py-4 mt-8 flex flex-row items-center justify-center'
      ]"
    >
      <p class="mr-4 text-gray-500 dark:text-gray-400 text-left">Dark Mode Toggle</p>
      <button class="focus:outline-none">
        <i :class="[isDark ? 'pi pi-moon' : 'pi pi-sun', 'text-xl']"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      number: '',
      email: '',
      password: ''
    }
  },
  methods: {
    async signUp() {
      try {
        const { user, error } = await this.$supabase.auth.signUp({
          email: this.email,
          password: this.password
        })
        if (error) {
          alert(error.message)
        } else {
          console.log('User signed up:', user)
          alert('Sign up successful!')
          this.$router.push({ name: 'home' }) // Navigate to the login page after successful sign-up
        }
      } catch (error) {
        console.error('Error signing up:', error)
        alert('Error signing up.')
      }
    }
  }
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
  background-color: rgb(24 24 27);
  margin-top: 2px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  width: 90%;
  border-radius: 0.5rem;
  color: #000000;
  border: 1px solid rgb(209 213 219);
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
  background-color: rgb(24 24 27);

  color: white;
  border: 1px solid rgb(107 114 128);
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

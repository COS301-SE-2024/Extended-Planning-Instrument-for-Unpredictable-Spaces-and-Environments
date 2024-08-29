<script setup>
import { ref, computed } from 'vue'
import { useDark } from '@vueuse/core'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import DialogComponent from '@/components/DialogComponent.vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

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
const phoneNumberError = ref(false)
const passwordError = ref(false)
const emailDuplicate = ref(false)

// Cell Number validation
const isValidPhoneNumber = computed(() => {
  const phoneRegex = /^0\d{9}$/
  return phoneRegex.test(number.value)
})
// Password validation
const isValidPassword = computed(() => {
  // Adjust the regex to fit your password criteria
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  return passwordRegex.test(password.value)
})

const signUp = async () => {
  try {
    if (!isValidPhoneNumber.value) {
      phoneNumberError.value = true
      return
    }
    if (!isValidPassword.value) {
      passwordError.value = true
      return
    }
    phoneNumberError.value = false
    passwordError.value = false

    // console.log(email.value)
    // console.log(password.value)
    const { user, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) {
      console.log(error.message)
      if (error.message == 'User already registered') {
        emailDuplicate.value = true
        return
      }
    } else {
      console.log('User signed up:', user)
      toast.add({
        severity: 'success',
        summary: 'Successfully signed up',
        detail: user,
        life: 10000
      })
      const { data, error } = await supabase.functions.invoke('core', {
        body: {
          type: 'insertUser',
          fullname: name.value,
          email: email.value,
          role: 'unassigned',
          phone: number.value
        }
      })
      // console.log(name.value, email.value, number.value)
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

      <!-- Text container -->
      <div
        :class="[
          'flex flex-col w-full mb-6',
          'items-start justify-start text-left', // Align text left on smaller screens
          'sm:items-center sm:text-center' // Center text on larger screens
        ]"
      >
        <p class="text-3xl font-bold mb-2" :class="[isDark ? 'text-white' : 'text-neutral-800']">
          Create your new account
        </p>
        <p class="mb-4" :class="[isDark ? 'text-gray-400' : 'text-neutral-800']">
          Join us and revolutionize logistics efficiency.
        </p>
      </div>

      <form @submit.prevent="signUp" class="sign-up-form">
        <div class="form-group">
          <label for="name" :class="[isDark ? 'text-white' : 'text-neutral-900', 'block font-bold']"
            >Full Name</label
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
            placeholder="eg. John Doe"
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
              'mt-2 mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500',
              { 'border-red-500 border-2': phoneNumberError }
            ]"
            type="tel"
            id="number"
            v-model="number"
            required
            placeholder="e.g. 012 345 6789"
            class="form-control"
            @input="phoneNumberError = false"
          />
        </div>
        <p v-if="phoneNumberError" class="text-red-500 text-sm mb-4">
          Please enter a valid 10-digit phone number starting with 0.
        </p>
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
              'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500',
              { 'border-red-500 border-2': emailDuplicate }
            ]"
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="example@example.com"
            class="form-control"
            @input="emailDuplicate = false"
          />
        </div>
        <p v-if="emailDuplicate" class="text-red-500 text-sm mb-4">
          This email has already been registered.
        </p>

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
            class="mt-2 w-full p-password"
            :class="{ 'password-error': passwordError }"
            @input="passwordError = false"
            @blur="validatePassword"
          >
            <p v-if="number.value && !isValidPhoneNumber" class="text-red-500 text-sm mb-4">
              Please enter a valid 10-digit phone number starting with 0.
            </p>
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
          <p v-if="passwordError" class="text-red-500 text-sm mt-6">
            Password must be at least 8 characters long and include one lowercase, one uppercase,
            and one numeric character.
          </p>
          <button
            type="submit"
            class="mb-6 mt-6 sign-in-button w-full py-2 bg-orange-500 text-white rounded-lg text-lg font-semibold hover:transform hover:-translate-y-1 transition duration-300"
          >
            Create new account
          </button>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-center">
          Already have an account?
          <router-link to="/" class="text-orange-500">Login</router-link>
        </p>
      </form>
      <p
        @click="toggleDialog"
        class="mt-4 flex items-center justify-center text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
      >
        Help
      </p>
      <!-- <div class="flex items-center justify-center">
        <div
          @click="toggleDark"
          :class="[
            isDark ? 'text-white bg-neutral-900' : 'text-neutral-800 bg-gray-200 shadow-sm',
            'w-[200px] cursor-pointer h-[auto] rounded-lg py-4 mt-6 flex flex-row items-center justify-center hover:-translate-y-1 transition duration-300'
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
      </div> -->
    </div>

    <DialogComponent
      v-if="showDialog"
      :images="[
        { src: '/Members/Photos/Login _ landing page.png', alt: 'Image 1' },
        { src: '/Members/Photos/Sign-up.png', alt: 'Image 2' }
        // Add more images as needed
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
  <Toast />
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
  padding-bottom: 0.5rem;
  width: 90%;
  border-radius: 0.5rem;
  color: #000000;
  border: 1px solid #171717 !important;
  background-color: white;
}

.p-password.password-error input {
  border: 2px solid #ff0000 !important;
}

.dark .p-password input {
  background-color: #262626;
  margin-top: 2px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 0.5rem;
  width: 90%;
  border-radius: 0.5rem;
  color: #000000;
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

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

const name = ref('')
const number = ref('')
const email = ref('')
const password = ref('')
const phoneNumberError = ref(false)
const passwordError = ref(false)
const emailDuplicate = ref(false)
const nameError = ref(false)

const isValidName = computed(() => {
  const nameRegex = /^[a-zA-Z\s]+$/
  return nameRegex.test(name.value.trim()) && name.value.trim().length > 0
})
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

const validateName = () => {
  nameError.value = !isValidName.value
}
const validatePhoneNumber = () => {
  phoneNumberError.value = !isValidPhoneNumber.value
}

const signUp = async () => {
  try {
    validateName()
    validatePhoneNumber()

    if (nameError.value || phoneNumberError.value) {
      return
    }
    if (!isValidPassword.value) {
      passwordError.value = true
      return
    }
    passwordError.value = false

    const { user, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) {
      if (error.message == 'User already registered') {
        emailDuplicate.value = true
        return
      }
    } else {
      toast.add({
        severity: 'success',
        summary: 'Successfully signed up',
        detail: user,
        life: 10000
      })
      const { data, error } = await supabase.functions.invoke('core', {
        body: {
          type: 'updateUser',
          fullname: name.value,
          email: email.value,
          role: 'unassigned',
          phone: number.value
        }
      })
      if (error) {
        console.error('API Error:', error)
      } else {
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
        'sign-in-container w-full min-h-screen px-4 py-8 sm:h-auto sm:w-[500px] sm:min-h-0 mx-auto sm:p-14',
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
          class="w-36 h-auto sm:w-48"
        />
        <img
          v-else
          src="@/assets/Photos/Logos/Wording-Thin-Light.svg"
          alt="Light Mode Image"
          class="w-36 h-auto sm:w-48"
        />
      </div>
      <div
        :class="[
          'flex flex-col w-full mb-4',
          'items-start justify-start text-left', // Align text left on smaller screens
          'sm:items-center sm:text-center' // Center text on larger screens
        ]"
      >
        <p class="mb-2 mt-2" :class="[isDark ? 'text-gray-400' : 'text-neutral-800']">
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
              'mt-2  mb-4 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500'
            ]"
            type="text"
            id="name"
            v-model="name"
            required
            placeholder="eg. John Doe"
            class="form-control"
            @input="nameError = false"
            @blur="validateName"
          />
          <p v-if="nameError" class="text-red-500 text-sm mb-4">
            Please enter a valid name (only letters and spaces allowed).
          </p>
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
              'mt-2 mb-4 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500',
              { 'border-red-500 border-2': phoneNumberError }
            ]"
            type="tel"
            id="number"
            v-model="number"
            required
            placeholder="e.g. 012 345 6789"
            class="form-control"
            @input="phoneNumberError = false"
            @blur="validatePhoneNumber"
          />
          <p v-if="phoneNumberError" class="text-red-500 text-sm mb-4">
            Please enter a valid 10-digit phone number starting with 0.
          </p>
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
    </div>

    <DialogComponent
      v-if="showDialog"
      :images="images"
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
import { getAssetURL } from '@/assetHelper'
export default {
  components: {
    DialogComponent
  }
}
const showDialog = ref(false)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}
const images = computed(() => [
  { src: getAssetURL('Photos/Help/LoginSignup/1.png'), alt: 'Alternative Image 1' },
  { src: getAssetURL('Photos/Help/LoginSignup/2.png'), alt: 'Alternative Image 4' },
  { src: getAssetURL('Photos/Help/LoginSignup/3.png'), alt: 'Alternative Image 3' },
  { src: getAssetURL('Photos/Help/LoginSignup/4.png'), alt: 'Alternative Image 4' },
  { src: getAssetURL('Photos/Help/LoginSignup/5.png'), alt: 'Alternative Image 5' }
])
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=SF+Compact&display=swap');

.font-sf-compact {
  font-family: 'SF Compact', sans-serif;
}

.custom-icon-width {
  width: 50px; /* Adjust the width as needed */
}

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

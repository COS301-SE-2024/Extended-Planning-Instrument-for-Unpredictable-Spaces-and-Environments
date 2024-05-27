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
        'sign-in-container w-[500px] h-auto mx-auto p-14 rounded-xl shadow-xl font-sf-compact'
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
          <label for="name" :class="[isDark ? 'text-white' : 'text-zinc-900', 'block font-bold']">
            First Name
          </label>
          <input
            :class="[
              isDark ? 'text-white border-gray-500 bg-zinc-900' : 'border border-gray-300 bg-white text-zinc-800',
              'mt-2 mb-6 form-control w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-yellow-600'
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
          <label for="name" :class="[isDark ? 'text-white' : 'text-zinc-900', 'block font-bold']">
            Phone Number
          </label>
          <input
            :class="[
              isDark ? 'text-white border-gray-500 bg-zinc-900' : 'border border-gray-300 bg-white text-zinc-800',
              'mt-2 mb-6 form-control w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-yellow-600'
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
          <label for="email" :class="[isDark ? 'text-white' : 'text-zinc-900', 'blo ck font-bold']">
            Email
          </label>
          <input
            :class="[
              isDark ? 'text-white border-gray-500 bg-zinc-900' : 'border border-gray-300 bg-white text-zinc-800',
              'mt-2 mb-6 form-control w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-yellow-600'
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
          <label for="password" :class="[isDark ? 'text-white' : 'text-zinc-800', 'block font-bold']">
            Password
          </label>

          <Password
            v-model="password"
            id="password"
            toggleMask
            required
            class="w-full"
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
          </button>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-center">
          Already have an account?
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
      class="dark-mode-toggle"
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
      email: '',
      password: '',
      name: '',
      number: '',
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

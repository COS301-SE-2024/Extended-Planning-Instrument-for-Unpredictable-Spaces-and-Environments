<template>
  <!-- Sidebar -->
  <div
    class="h-[100vh] p-4 flex flex-col justify-between transition-all duration-300 ease-in-out"
    :class="[
      isMobileSidebarCollapsed ? 'w-[80px]' : 'w-[300px]',
      isDark ? 'bg-neutral-950' : 'bg-white'
    ]"
  >
    <div>
      <div
        :class="[
          'flex',
          isMobileSidebarCollapsed ? 'flex-col' : 'flex-row',
          'items-baseline',
          { 'justify-center': isMobileSidebarCollapsed }
        ]"
      >
        <div class="logo-container">
          <img
            v-if="isMobileSidebarCollapsed"
            :src="
              isDark
                ? '/Members/Photos/Logos/Logo-Icon-Dark.svg'
                : '/Members/Photos/Logos/Logo-Icon-Light.svg'
            "
            alt="JS Logo"
            class="mr-4 mb-4 mt-2"
            style="width: 5rem; height: auto"
          />
          <img
            v-else
            :src="
              isDark
                ? '/Members/Photos/Logos/Wording-Thin-Dark.svg'
                : '/Members/Photos/Logos/Wording-Thin-Light.svg'
            "
            alt="Janeeb Solutions Logo"
            class="mr-4 mb-4 mt-2 ml-2"
            style="width: 10rem; height: auto"
          />
        </div>
      </div>

      <button
        @click="toggleShipment"
        class="h-[45px] rounded-xl mt-2 px-4 py-2 bg-yellow-700 text-white mb-4 flex items-center"
        :class="{ 'w-full': !isMobileSidebarCollapsed, 'w-[48px]': isMobileSidebarCollapsed }"
      >
        <i
          class="pi pi-box text-white"
          :class="{
            'm-0 ': isMobileSidebarCollapsed,
            'mr-4': !isMobileSidebarCollapsed
          }"
        ></i>
        <p :class="{ 'opacity-0': isMobileSidebarCollapsed }" class="justify-center ml-2">
          New Shipment
        </p>
      </button>

      <!-- Menu -->
      <Menu
        :class="[isDark ? 'dark' : 'light', 'specific-container']"
        :model="items"
        :router="router"
        class="w-full md:w-15rem p-menu-custom specific-container"
        :exact="false"
      >
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ /*href,*/ navigate }" :to="item.route" custom>
            <a
              class="h-[45px] flex align-items-center mb-2"
              v-bind="props.action"
              @click="navigate"
            >
              <span :class="item.icon"></span>
              <span
                class="ml-2 transition-opacity duration-300 ease-in-out"
                :class="{
                  '': !isMobileSidebarCollapsed,
                  'opacity-0 w-[48px]': isMobileSidebarCollapsed
                }"
              >
                {{ item.label }}
              </span>
              <Badge severity="contrast" v-if="item.badge" class="ml-auto" :value="item.badge" />
            </a>
          </router-link>
          <a
            class="h-[45px] flex align-items-center mb-2"
            v-else
            v-ripple
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span :class="item.icon"></span>
            <span
              class="ml-2 transition-opacity duration-300 ease-in-out"
              :class="{
                '': !isMobileSidebarCollapsed,
                'opacity-0 w-[48px]': isMobileSidebarCollapsed
              }"
            >
              {{ item.label }}
            </span>
          </a>
        </template>
      </Menu>
    </div>

    <button
      class="relative overflow-hidden w-full p-link flex align-items-center text-color hover:surface-200 border-noround"
    >
      <div class="flex-shrink-0">
        <Avatar
          :label="avatarLabel"
          class="mr-2 border border-neutral-900"
          size="large"
          shape="circle"
        />
      </div>
      <span
        class="inline-flex flex-col transition-opacity duration-300 ease-in-out"
        :class="{ 'opacity-0': isMobileSidebarCollapsed }"
      >
        <span class="font-bold">{{ userFullName }}</span>
        <span class="text-sm">{{ userRole }}</span>
      </span>
    </button>
  </div>

  <Dialog
    v-model:visible="showShipment"
    :class="[isDark ? 'dark' : '', 'w-[90%] rounded-lg']"
    header="Add shipments"
    :modal="true"
    @close-dialog="toggleShipment"
  >
    <div class="flex flex-col items-center justify-center m-4">
      <p class="mb-4 text-3xl">New Shipment</p>

      <input
        type="file"
        accept=".csv"
        @change="onFileChange"
        class="mb-4"
      />
      <Button @click="processShipment" class="mt-4 py-2 px-6 bg-green-800">Process Shipment</Button>
      <Button @click="toggleShipment" class="mt-4 py-2 px-6 bg-red-800">Cancel</Button>
    </div>
  </Dialog>

  <DialogComponent
    v-if="showDialog"
    :images="[
      { src: '/Members/Photos/manager dashboard.png', alt: 'Alternative Image 1' },
      { src: '/Members/Photos/manager dashboard (Sidebar).png', alt: 'Alternative Image 2' },
      { src: '/Members/Photos/edit-user.png', alt: 'Alternative Image 3' },
      { src: '/Members/Photos/manager dashboard (Tracking page).png', alt: 'Alternative Image 4' },
      { src: '/Members/Photos/manager dashboard (Shipments page).png', alt: 'Alternative Image 5' }
    ]"
    title="Contact Support"
    :contacts="[
      { name: 'Call', phone: '+27 12 345 6789', underline: true },
      { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
    ]"
    :dialogVisible="showDialog"
    @close-dialog="toggleDialog"
  />
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import DialogComponent from '@/components/DialogComponent.vue'

// Initialize Supabase client
const supabaseUrl = 'https://rgisazefakhdieigrylb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjMxMzE1MSwiZXhwIjoyMDMxODg5MTUxfQ.ctQmfWfRjY77afjwWuynIL4lRdjrtBD7Xqh75SxQBeo'
const supabase = createClient(supabaseUrl, supabaseKey)

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()

const isMobileSidebarCollapsed = ref(false)
const userFullName = ref('')
const userRole = ref('')
const avatarLabel = computed(() => {
  return userFullName.value ? userFullName.value.charAt(0).toUpperCase() : 'P'
})

const fetchUserDetails = async () => {
  const session = await supabase.auth.getSession()
  if (session.data.session) {
    const { user } = session.data.session
    const { data, error } = await supabase
      .from('Users')
      .select('FullName, Role')
      .eq('Email', user.email)
      .single()

    if (error) {
      console.log('Error fetching user:', error)
    } else {
      userFullName.value = data.FullName
      userRole.value = data.Role
    }
  } else {
    console.log('No session found')
  }
}

const checkWindowSize = () => {
  isMobileSidebarCollapsed.value = window.innerWidth < 1024
}

onMounted(() => {
  fetchUserDetails()
  checkWindowSize()
  window.addEventListener('resize', checkWindowSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkWindowSize)
})

const logout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  } else {
    router.push({ name: 'login' })
  }
}

const showDialog = ref(false)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}

const showShipment = ref(false)
const toggleShipment = () => {
  showShipment.value = !showShipment.value
}

const selectedFile = ref(null)
const onFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const processShipment = async () => {
  if (!selectedFile.value) {
    alert("Please select a file")
    return
  }

  try {
    const { data, error } = await supabase.storage
      .from('data_bucket')
      .upload(`Upload-${selectedFile.value.name}`, selectedFile.value)

    if (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file")
    } else {
      alert("File uploaded successfully")
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    alert("Error uploading file")
  }
}

const items = [
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-clipboard',
    route: 'dashboard',
    active: false
  },
  {
    label: 'Shipments',
    icon: 'pi pi-fw pi-truck',
    route: '/',
    active: false
  },
  {
    label: 'Tracking',
    icon: 'pi pi-fw pi-map',
    route: 'packer',
    active: false
  },
  {
    label: 'Inventory',
    icon: 'pi pi-fw pi-box',
    route: '/',
    active: false
  },
  {
    label: 'Manage Users',
    icon: 'pi pi-fw pi-lock',
    route: 'manage-users',
    active: false
  },
  {
    label: 'Dark Mode Toggle',
    icon: 'pi pi-fw pi-moon',
    command: () => {
      toggleDark()
    }
  },
  {
    label: 'Log Out',
    icon: 'pi pi-fw pi-sign-out',
    command: () => {
      logout()
    }
  },
  {
    label: 'Help',
    icon: 'pi pi-fw pi-question',
    command: () => {
      toggleDialog()
    }
  }
]
</script>

<style>
/* General styles */
.mobile-icon {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-icon {
    display: inline;
  }
}

.dark .p-menu {
  background-color: #0a0a0a;
}

.dark .p-menuitem {
  &.p-focus {
    > .p-menuitem-content {
      background-color: #262626 !important;
      border-radius: 1rem;
    }
  }
}

.dark .p-menuitem:hover > .p-menuitem-content {
  background-color: #262626 !important;
  border-radius: 1rem;
}

.p-calendar {
  width: 100%;
  height: auto;
}

.p-chart {
  height: auto;
}

.transition-opacity {
  transition: opacity 0.3s ease-in-out;
}

@media (max-width: 1024px) {
  .specific-container .p-menuitem {
    width: 48px !important;
    border-radius: 1rem;
  }
  .specific-container .p-menu {
    width: 48px !important;
    background-color: transparent !important;
  }

  .dark .p-menuitem:not(.active-menu-item):hover > .p-menuitem-content {
    background-color: #262626 !important;
    border-radius: 1rem;
  }
}

.specific-container .p-menuitem {
  border-radius: 1rem;
}

.specific-container .p-menu {
  background-color: transparent !important;
}

.dark .p-menuitem:not(.active-menu-item):hover > .p-menuitem-content {
  background-color: #262626 !important;
  border-radius: 1rem;
}

.light .p-menu {
  color: black;
  background-color: #0a0a0a;
  background: #0a0a0a;
}

.light .p-menuitem {
  color: black;
}

.light .p-menu-list {
  color: rgba(0, 0, 0, 0.87) !important;
  stroke: black !important;
  fill: black !important;
  background-color: white;
  background: transparent;
}

.light a {
  color: black !important;
}

.p-menu {
  padding: 0.5rem 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.87);
  border-radius: 4px;
  min-width: 12.5rem;
}

.light .p-menuitem {
  &.p-focus {
    > .p-menuitem-content {
      background-color: #f3f4f6 !important;
      border-radius: 1rem;

      span {
        color: black !important;
      }
    }
  }
}

.light .p-menuitem:hover > .p-menuitem-content {
  background-color: #262626 !important;
  border-radius: 1rem;

  span {
    color: white !important;
  }
}

.p-dialog-mask {
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: 9998 !important;
}

.dark h1 {
  color: white !important;
  background-color: #0c0a09 !important;
}

.light .p-menuitem:not(.active-menu-item):hover > .p-menuitem-content {
  background-color: #f3f4f6 !important;
  border-radius: 1rem;
}

.light .p-menuitem:not(.active-menu-item):hover > .p-menuitem-content span {
  color: black !important;
}
</style>

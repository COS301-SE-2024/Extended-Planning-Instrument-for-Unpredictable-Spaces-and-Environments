<script setup>
import { useDark, useToggle } from '@vueuse/core'
import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // Import the router

const isDark = useDark()
const toggleDark = useToggle(isDark) // Proper toggle function
const router = useRouter() // Use the router instance

const isMobileSidebarCollapsed = ref(false)

// Toggle the sidebar collapse state
const toggleMobileSidebar = () => {
  isMobileSidebarCollapsed.value = !isMobileSidebarCollapsed.value
}

// Function to check window size and update sidebar state
const checkWindowSize = () => {
  isMobileSidebarCollapsed.value = window.innerWidth < 1024
  console.log('Small window size: ' + window.innerWidth)
}

// Add event listener on mounted and remove on unmounted
onMounted(() => {
  checkWindowSize()
  window.addEventListener('resize', checkWindowSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkWindowSize)
})

const items = [
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-clipboard',
    command: () => {
      console.log('Navigating to Dashboard')
      router.push({ name: 'dashboard' }) // Navigate to the login page after logout
    }
  },
  {
    label: 'Shipments',
    icon: 'pi pi-fw pi-truck',
    command: () => {
      console.log('Navigating to Shipments')
      router.push({ name: '/' })
    }
  },
  {
    label: 'Tracking',
    icon: 'pi pi-fw pi-map',
    command: () => {
      console.log('Navigating to Tracking')
      router.push({ name: '/' })
    }
  },
  {
    label: 'Messages',
    icon: 'pi pi-fw pi-envelope',
    severity: 'warning',
    badge: '5',
    command: () => {
      console.log('Navigating to Messages')
      router.push({ name: '/' })
    }
  },
  {
    label: 'Inventory',
    icon: 'pi pi-fw pi-box',
    command: () => {
      console.log('Navigating to Inventory')
      router.push({ name: '/' })
    }
  },
  {
    label: 'Profile',
    icon: 'pi pi-fw pi-user',
    command: () => {
      console.log('Navigating to Profile')
      router.push({ name: '/' })
    }
  },
  {
    label: 'Manage Users',
    icon: 'pi pi-fw pi-lock',
    command: () => {
      console.log('Navigating to Manage Users')
      router.push({ name: 'manage-users' })
    }
  },
  {
    label: 'Dark Mode Toggle',
    icon: 'pi pi-fw pi-moon',
    command: () => {
      console.log('Toggling Dark Mode')
      toggleDark() // Correctly call the toggle function
    }
  },
  {
    label: 'Log Out',
    icon: 'pi pi-fw pi-sign-out',
    command: () => {
      console.log('Logging Out')
      router.push({ name: 'login' }) // Navigate to the login page after logout
    }
  }
]
</script>

<template>
  <!-- Sidebar -->
  <div
    class="h-[100vh] bg-neutral-950 p-4 flex flex-col justify-between transition-all duration-300 ease-in-out"
    :class="{ 'w-[80px]': isMobileSidebarCollapsed, 'w-[300px]': !isMobileSidebarCollapsed }"
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
        <i
          class="pi pi-box text-white"
          :class="{
            'm-0 opacity-0': isMobileSidebarCollapsed,
            'mr-4': !isMobileSidebarCollapsed
          }"
        ></i>
        <h1 class="font-semibold mb-4 transition-opacity duration-300 ease-in-out">
          {{ isMobileSidebarCollapsed ? 'JS' : 'JANEEB SOLUTIONS' }}
        </h1>
      </div>

      <button
        class="h-[45px] rounded-xl mt-2 px-4 py-2 bg-yellow-700 text-white mb-4 flex items-center"
        :class="{ 'w-full': !isMobileSidebarCollapsed, 'w-[48px]': isMobileSidebarCollapsed }"
      >
        <i class="pi pi-box text-white mobile-icon"></i>
        <p :class="{ 'opacity-0': isMobileSidebarCollapsed }" class="justify-center ml-2">
          New Shipment
        </p>
      </button>

      <!-- Menu -->
      <Menu :model="items" :router="router" class="w-full md:w-15rem p-menu-custom" :exact="false">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a
              class="h-[45px] flex align-items-center mb-2"
              v-bind="props.action"
              @click="navigate"
            >
              <span :class="item.icon" />
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
            <span :class="item.icon" />
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

    <!-- John Doe Section -->
    <button
      class="relative overflow-hidden w-full p-link flex align-items-center text-color hover:surface-200 border-noround"
    >
      <div class="flex-shrink-0">
        <!-- Wrap Avatar in a div to maintain aspect ratio -->
        <Avatar label="P" class="mr-2" size="large" shape="circle" />
      </div>
      <span
        class="inline-flex flex-col transition-opacity duration-300 ease-in-out"
        :class="{ 'opacity-0': isMobileSidebarCollapsed }"
      >
        <span class="font-bold">John Doe</span>
        <span class="text-sm">Admin</span>
      </span>
    </button>
  </div>
</template>

<style>
/* General styles */
.mobile-icon {
  display: none;
}

/* When the screen width is less than 768px, show the mobile icon */
@media (max-width: 1024px) {
  .mobile-icon {
    display: inline;
  }
}

/* Update styles for hovered menu item link */
.p-menu {
  background-color: #0a0a0a;
}

.p-menuitem {
  &.p-focus {
    > .p-menuitem-content {
      background-color: #262626 !important;
      border-radius: 1rem;
    }
  }
}

.p-menuitem:hover > .p-menuitem-content {
  background-color: #a16207 !important;
  border-radius: 1rem;
}

.p-calendar {
  width: 100%; /* Take up full width of parent */
  height: auto;
}

.p-chart {
  height: auto;
}

.transition-opacity {
  transition: opacity 0.3s ease-in-out;
}

@media (max-width: 1024px) {
  .p-menuitem {
    width: auto;
    border-radius: 1rem;
  }
  .p-menu {
    width: auto;
    background-color: transparent !important;
  }
}

/* Additional media query for sidebar collapse */
@media (max-width: 1024px) {
  .p-menuitem {
    width: 48px !important;
    border-radius: 1rem;
  }
  .p-menu {
    width: 48px !important;
    background-color: transparent !important;
  }
}
</style>

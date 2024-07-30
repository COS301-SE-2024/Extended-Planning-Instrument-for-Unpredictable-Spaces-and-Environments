<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // Import the router
import { supabase } from '@/supabase'
import DialogComponent from '@/components/DialogComponent.vue'
const dialogVisible = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark) // Proper toggle function
const router = useRouter() // Use the router instance

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log(error)
  } else {
    router.push({ name: 'login' })
    console.log('Log out successful')
  }
}
components: {
  DialogComponent
}
const showDialog = ref(false)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}
const items = [
  {
    label: 'Start New Delivery',
    icon: 'pi pi-fw pi-truck',
    command: () => {
      console.log('Navigating to Dashboard')
      router.push({ name: 'dashboard' }) // Navigate to the login page after logout
    }
  },
  {
    label: 'Updates',
    icon: 'pi pi-fw pi-envelope',
    severity: 'warning',
    badge: '5',
    command: () => {
      console.log('Navigating to Messages')
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
      logout()
    }
  },
  {
    label: 'Help',
    icon: 'pi pi-fw pi-question',
    command: () => {
      console.log('Opening Help Menu')
      toggleDialog()
    }
  }
]
</script>

<template>
  <div :class="[isDark ? 'dark' : 'light', 'h-full']">
    <Menubar :model="items" class="w-full specific-menubar">
      <template #start>
        <svg
          height="40"
          viewBox="0 0 35 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="[isDark ? 'text-white' : '', 'h-8']"
        >
          <path d="..." fill="var(--primary-color)" />
          <path d="..." fill="var(--text-color)" />
        </svg>
      </template>
      <template #item="{ item, props, hasSubmenu, root }">
        <a v-ripple class="flex items-center p-6" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
          <Badge
            v-if="item.badge"
            :class="{ 'ml-auto': !root, 'ml-2': root }"
            :value="item.badge"
            class="bg-yellow-500 text-black px-2"
          />
          <span
            v-if="item.shortcut"
            class="ml-auto border border-gray-400 bg-gray-100 text-xs p-1"
            >{{ item.shortcut }}</span
          >
          <i
            v-if="hasSubmenu"
            :class="['pi', root ? 'pi-angle-down ml-2' : 'pi-angle-right ml-auto']"
          ></i>
        </a>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <div
            :class="[
              isDark
                ? 'border-neutral-500 bg-neutral-950 text-white'
                : 'border-gray-500 bg-white text-black',
              'border flex items-center px-4 py-2 rounded-md focus-within:ring-2 focus-within:ring-yellow-600'
            ]"
          >
            <i :class="[isDark ? 'text-white' : 'text-black', 'pi pi-search mr-2']"></i>
            <InputText
              placeholder="Search"
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'focus:outline-none focus:ring-0 w-32 sm:w-auto'
              ]"
            />
          </div>
        </div>
      </template>
    </Menubar>
    <div>
      <DialogComponent
        v-if="showDialog"
        :images="[
          { src: '/Members/Photos/delivery-dashboard.png', alt: 'Alternative Image 1' },
          { src: '/Members/Photos/delivery-sidebar.png', alt: 'Alternative Image 2' },
          {
            src: '/Members/Photos/manager dashboard (Tracking page).png',
            alt: 'Alternative Image 3'
          },
          {
            src: '/Members/Photos/manager dashboard (Shipments page).png',
            alt: 'Alternative Image 4'
          }
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
  </div>
</template>

<style>
/* General styles */
.mobile-icon {
  display: none;
}
.light {
  background-color: white;
  color: black;
}
.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  border-radius: 0;
  color: white;
}
/* Update styles for hovered menu item link */
.dark .p-menu {
  background-color: #0a0a0a;
  border-radius: 0;
}
.dark .p-menubar {
  border-radius: 0;
}
.dark .p-menuitem {
  &.p-focus {
    > .p-menuitem-content {
      background-color: #262626 !important;
    }
  }
}

.dark .p-menuitem:hover > .p-menuitem-content {
  background-color: #a16207 !important;
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

/* Additional media query for sidebar collapse */

.light .p-menu {
  color: black;
  background-color: #0a0a0a;
  background: #0a0a0a;
}
.light .p-menuitem {
  color: black;
}

.dark .p-menubar {
  padding: 1rem;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.87);
}
.p-menubar {
  padding: 1rem;
  background: #ffffff;
  color: rgba(255, 255, 255, 0.87);
}
.p-icon {
  display: inline-block;
  color: #0a0a0a;
}

.light .p-menu-list {
  color: rgba(0, 0, 0, 0.87) !important;
  stroke: black !important;
  fill: black !important;
  background-color: white;
  background: transparent;
}

.dark .a {
  color: white !important;
}

.a {
  color: white !important;
}
.p-menu {
  padding: 0.5rem 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.87);
}
.dark .p-menu {
  padding: 0.5rem 0;
  background: transparent;
}
.light .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  transition: none;
  background: white;
  border-bottom: 0.1px solid rgb(74, 74, 74); /* Only apply a border to the bottom */
  color: black;
}
.dark .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  transition: none;
  background: #0a0a0a;
  border-bottom: 0.1px solid rgb(74, 74, 74); /* Only apply a border to the bottom */
  color: white;
}
.dark .p-icon {
  display: inline-block;
  color: #ffffff;
}
.light .p-menuitem {
  &.p-focus {
    > .p-menuitem-content {
      background-color: #f3f4f6 !important;
      /* Explicitly set color for spans inside */
      color: black;
      span {
        color: black !important;
      }
    }
  }
}

.light .p-menuitem:hover > .p-menuitem-content {
  background-color: #a16207 !important;
  color: white !important;

  /* Explicitly set color for spans inside */
  span {
    color: white !important;
  }
}
</style>

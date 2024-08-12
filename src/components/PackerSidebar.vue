<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const isDark = useDark()
const toggleDark = useToggle(isDark) // Proper toggle function
const router = useRouter() // Use the router instance
const dialogVisible = ref(false)
const toggleDialog = () => {
  dialogVisible.value = !dialogVisible.value
}
async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.log(error)
  } else {
    router.push({ name: 'login' })
  }
}
const emit = defineEmits(['handle-json'])

//API CALLS FOR SHIPMENTS
const shipmentsByProcessing = ref([])
const getAllProcessing = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getAllProcessing' }),
      method: 'POST'
    })
    if (error) {
      console.log('API Error:', error)
    } else {
      console.log('Data', data.data)
      shipmentsByProcessing.value = data.data
      console.log('SHIPS', shipmentsByProcessing)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const items = [
  {
    label: 'Start New Shipment',
    icon: 'pi pi-fw pi-clipboard',
    command: () => {
      toggleDialog()
    }
  },

  {
    label: 'Dark Mode Toggle',
    icon: 'pi pi-fw pi-moon',
    command: () => {
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
  }
]

const packingResults = ref(null)
const runPackingAlgo = async (shipmentId) => {
  console.log('Shipment Id:', shipmentId)
  const { data, error } = await supabase.functions.invoke('packing', {
    body: JSON.stringify({
      type: 'geneticAlgorithm',
      ShipmentID: shipmentId,
      containerDimensions: [1200, 1380, 2800]
    }),
    method: 'POST'
  })

  if (error) {
    console.log('PACKING API ERROR: ', error)
  } else {
    console.log('PACKING API SUCCESS')
    emit('handle-json', data)
  }
}
const handleSelectShipment = (shipmentId) => {
  runPackingAlgo(shipmentId)
}

onMounted(() => {
  getAllProcessing()
})
</script>

<template>
  <div :class="[isDark ? 'dark' : 'light', 'h-full']">
    <Menubar :model="items" class="w-full">
      <template #start>
        <svg
          width="35"
          height="40"
          viewBox="0 0 35 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="[isDark ? 'text-white' : '', 'h-10']"
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
            class="bg-orange-600 text-black px-2"
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
          <div class="w-full md:w-[300px]">
            <div
              :class="[
                isDark
                  ? 'border-neutral-500 bg-neutral-950 text-white'
                  : 'border-gray-500 bg-white text-black',
                'border flex items-center px-4 py-2 rounded-md focus-within:ring-2 focus-within:ring-orange-600'
              ]"
            >
              <i :class="[isDark ? 'text-white' : 'text-black', 'pi pi-search mr-2']"></i>
              <InputText
                placeholder="Search"
                :class="[
                  isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                  'focus:outline-none focus:ring-0'
                ]"
              />
            </div>
          </div>
        </div>
      </template>
    </Menubar>
    <Dialog
      header="Edit User Profile"
      v-model:visible="dialogVisible"
      :modal="true"
      :closable="false"
      class="z-100000 w-[auto] p-4 relative"
    >
      <div
        :class="[isDark ? ' text-white border-white' : ' text-black border-black', 'border-b-2']"
        class="mb-4"
      >
        <p class="text-3xl mb-2">Current Shipments:</p>
      </div>
      <div v-if="isLoading">Loading shipments...</div>
      <div v-else-if="errorMessage">{{ errorMessage }}</div>
      <div v-else class="pb-12">
        <!-- Adjust padding to avoid overlap -->
        <div v-for="shipment in shipmentsByProcessing" :key="shipment.id" class="mb-8">
          <p class="text-neutral-400 text-lg">Shipment Status:</p>
          <p class="text-lg">{{ shipment.Status }}</p>
          <p class="text-neutral-500 text-lg">Shipment ID:</p>
          <p class="text-lg">{{ shipment.id }}</p>
          <p class="text-neutral-400 text-lg">Destination:</p>
          <p class="text-lg mb-2">{{ shipment.Destination }}</p>
          <Button
            @click="handleSelectShipment(shipment.id)"
            :class="[isDark ? 'text-white' : ' text-white', 'focus:outline-none focus:ring-0']"
            class="text-lg justify-center px-4 py-2 w-full bg-green-800"
            >Select Shipment</Button
          >
        </div>
        <div v-if="shipmentsByProcessing.length === 0">No shipments found.</div>
      </div>
      <div
        :class="[
          isDark ? 'bg-neutral-800 text-white' : 'bg-white text-white',
          'focus:outline-none focus:ring-0'
        ]"
        class="bg-neutral-800 p-6 absolute bottom-4 left-4 right-4"
      >
        <Button @click="toggleDialog()" class="text-lg justify-center px-4 py-2 w-full bg-red-800"
          >Close</Button
        >
      </div>
    </Dialog>
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

/* Update styles for hovered menu item link */
.dark .p-menu {
  background-color: #0a0a0a;
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
.light a {
  color: rgb(0, 0, 0) !important;
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
.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  transition: none;
  background: #171717;
  border-radius: 0;
  border-bottom: 0.1px solid rgb(74, 74, 74); /* Only apply a border to the bottom */
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
      span {
        color: black !important;
      }
    }
  }
}

.light .p-menuitem:hover > .p-menuitem-content {
  background-color: #a16207 !important;

  /* Explicitly set color for spans inside */
  span {
    color: white !important;
  }
}
</style>

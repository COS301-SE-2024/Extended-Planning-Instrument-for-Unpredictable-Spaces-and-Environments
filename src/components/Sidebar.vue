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

      <input type="file" accept=".csv" @change="onFileChange" class="mb-4" />
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
import Papa from 'papaparse'
import DialogComponent from '@/components/DialogComponent.vue'
import { Result } from 'postcss'

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

const validateCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        console.log('Parsed results:', results)

        if (results.data.length < 2) {
          reject('CSV file is empty or contains only headers')
          return
        }

        const headers = results.data[0]
        const expectedHeaders = ['ID', 'Width', 'Length', 'Height', 'Weight', 'Volume', 'Location']

        // Check headers
        if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
          reject(`Invalid CSV format: Headers do not match the expected format. 
            Expected: ${expectedHeaders.join(', ')}
            Actual: ${headers.join(', ')}`)
          return
        }

        // Check number of columns and data types
        for (let i = 1; i < results.data.length; i++) {
          const row = results.data[i]
          if (row.length !== 7) {
            reject(`Invalid CSV format: Row ${i + 1} has ${row.length} columns instead of 7`)
            return
          }

          // Check data types
          if (
            isNaN(Number(row[0])) || // ID
            isNaN(Number(row[1])) || // Width
            isNaN(Number(row[2])) || // Length
            isNaN(Number(row[3])) || // Height
            isNaN(Number(row[4])) || // Weight
            isNaN(Number(row[5])) || // Volume
            !row[6] ||
            typeof row[6] !== 'string' // Location
          ) {
            reject(
              `Invalid data in row ${i + 1}: All columns except Location must be numbers, and Location must be a non-empty string`
            )
            return
          }
        }

        resolve(true)
      },
      error: (error) => {
        reject(`Error parsing CSV: ${error}`)
      },
      header: false,
      skipEmptyLines: true
    })
  })
}

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

let maxShipmentID, maxDeliveryID, JSONText
async function processData(jsonData) {
  const { data: ShipID, error } = await supabase.functions.invoke('core', {
    body: JSON.stringify({ type: 'getMaxShipmentID' }),
    method: 'POST'
  })
  let maxShipmentID = ShipID.id + 1

  if (error) {
    console.log('API Error gettingMaxShipmentID:', error)
    return null
  } else {
    // Object to store unique locations
    const uniqueLocations = new Set()

    // First pass: collect unique locations
    jsonData.forEach((item) => {
      const location = item['Location\r'].trim() // Trim to remove any trailing \r
      uniqueLocations.add(location)
    })

    // Create locationMap with separate ID and location fields
    const locationMap = Array.from(uniqueLocations).map((location, index) => ({
      ID: maxShipmentID + index,
      location: location
    }))

    // Create a quick lookup object for efficiency
    const locationLookup = Object.fromEntries(locationMap.map((item) => [item.location, item.ID]))

    // Second pass: process the data and assign ShipmentIDs
    const processedData = jsonData.map((item) => {
      const location = item['Location\r'].trim()
      return {
        ...item,
        Location: location, // Replace 'Location\r' with 'Location'
        ShipmentID: locationLookup[location]
      }
    })

    return {
      locationMap,
      processedData
    }
  }
}

function convertCSVToJSON(csvText) {
  // Split the CSV text into lines
  const lines = csvText.trim().split('\n')

  // Extract headers from the first line
  const headers = lines[0].split(',')

  // Process each data row
  const jsonData = lines.slice(1).map((line) => {
    const values = line.split(',')
    const row = {}
    headers.forEach((header, index) => {
      // Convert numeric values to numbers, keep Location as string
      if (header !== 'Location') {
        row[header] = isNaN(values[index]) ? values[index] : Number(values[index])
      } else {
        row[header] = values.slice(index).join(',').trim() // Rejoin Location if it contains commas
      }
    })
    return row
  })

  return jsonData
}

const processShipment = async () => {
  if (!selectedFile.value) {
    alert('Please select a file')
    return
  }

  try {
    await validateCSV(selectedFile.value)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data_bucket')
      .upload(`uploads/${selectedFile.value.name}`, selectedFile.value)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      alert('Failed to upload file')
      return
    }

    const { data: CSVText, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'downloadFile', fileName: selectedFile.value.name }),
      method: 'POST'
    })

    if (error) {
      console.log('API Error downloadingFile:', error)
    } else {
      const jsonData = convertCSVToJSON(CSVText.data)

      JSONText = jsonData

      if (error) {
        console.log('API Error parsingCSV:', error)
      } else {
        const { data: DeliveryID, error } = await supabase.functions.invoke('core', {
          body: JSON.stringify({ type: 'getMaxDeliveryID' }),
          method: 'POST'
        })

        maxDeliveryID = DeliveryID.id

        if (error) {
          console.log('API Error getMaxDeliveryID:', error)
        } else {
          const { data, error } = await supabase.functions.invoke('core', {
            body: JSON.stringify({
              type: 'insertDelivery',
              newDeliveryId: maxDeliveryID
            }),
            method: 'POST'
          })

          if (error) {
            console.log('API Error insertingDelivery:', error)
          } else {
            const result = await processData(JSONText)

            for (let row of result['locationMap']) {
              const { data, error } = await supabase.functions.invoke('core', {
                body: JSON.stringify({
                  type: 'insertShipment',
                  shipment_id: row['ID'],
                  location: row['location'],
                  newDeliveryId: maxDeliveryID
                }),
                method: 'POST'
              })

              if (error) {
                console.log('API Error insertingShipment:', error)
                throw new Error('Failed to insert shipment')
              }
            }

            for (let row of result['processedData']) {
              const { data, error } = await supabase.functions.invoke('core', {
                body: JSON.stringify({
                  type: 'insertPackage',
                  Shipment_id: row['ShipmentID'],
                  Width: row['Width'],
                  Length: row['Length'],
                  Height: row['Height'],
                  Weight: row['Weight'],
                  Volume: row['Volume']
                }),
                method: 'POST'
              })

              if (error) {
                console.log('API Error insertingPackages:', error)
                throw new Error('Failed to insert package')
              }
            }
            console.log('All shipments and packages inserted successfully')
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing file:', error)
    alert('Error processing file: ' + error.message)

    selectedFile.value = null
    return
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
    route: '/shipments',
    active: false
  },
  {
    label: 'Tracking',
    icon: 'pi pi-fw pi-map',
    route: 'tracking',
    active: false
  },
  {
    label: 'Inventory',
    icon: 'pi pi-fw pi-box',
    route: '/inventory',
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

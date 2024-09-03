<template>
  <!-- Sidebar -->
  <div class="main-sidebar">
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
          class="h-[45px] rounded-xl mt-2 px-4 py-2 bg-orange-600 text-white mb-4 flex items-center"
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
          class="w-full md:w-[15rem] p-menu-custom specific-container"
          :exact="false"
        >
          <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ /*href,*/ navigate }" :to="item.route" custom>
              <a
                aria-hidden="false"
                :class="[
                  'h-[45px]  flex align-items-center mb-2',
                  item.active ? 'active-menu-item' : ''
                ]"
                v-bind="props.action"
                @click="navigate(item.route)"
              >
                <i class="mr-2" :class="item.icon"></i>
                <span v-if="!isMobileSidebarCollapsed">{{ item.label }}</span>
                <Badge severity="contrast" v-if="item.badge" class="ml-auto" :value="item.badge" />
              </a>
            </router-link>
            <a
              v-else
              :class="[
                'h-[45px] flex align-items-center mb-2',
                item.active ? 'active-menu-item' : ''
              ]"
              v-bind="props.action"
              :target="item.target"
              :href="item.url"
              @click.prevent="showDialog"
              :style="{ cursor: showDialog ? 'default' : 'pointer' }"
            >
              <span class="mr-2" :class="item.icon"></span>
              <span v-if="!isMobileSidebarCollapsed">{{ item.label }}</span>
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
    <!-- <input type="file" accept=".csv" @change="onFileChange" /> -->
    <!-- <input type="file" accept=".csv" @change="onFileChange" /> -->
    <!-- <input type="file" accept=".csv" @change="onFileChange" /> -->

    <Dialog
      v-model:visible="showShipment"
      :class="[isDark ? 'dark' : 'light', 'w-[50%] max-w-xs rounded-lg']"
      :modal="true"
      @close-dialog="toggleShipment"
    >
      <div class="flex flex-col items-center justify-center m-8">
        <p class="mb-4 text-3xl">New Shipment</p>

        <label
          class="cursor-pointer flex flex-col items-center justify-center w-full max-w-xs p-2 bg-orange-600 text-white rounded-md shadow-md hover:bg-black transition-all duration-200 ease-in-out"
        >
          <span>Choose a CSV file</span>
          <input type="file" accept=".csv" @change="onFileChange" class="hidden" />
        </label>

        <!-- Display the file name or a confirmation message -->
        <p
          v-if="selectedFile"
          class="text-sm mt-4"
          :class="[isDark ? 'text-white ' : 'text-black']"
        >
          Selected file: {{ selectedFile.name }}
        </p>

        <Button
          @click="processShipment"
          :disabled="!selectedFile || loading"
          :loading="loading"
          :class="[
            'w-full max-w-xs mt-4 items-center justify-center text-white py-2 px-6',
            selectedFile ? 'bg-green-800 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          ]"
        >
          <template v-if="loading">
            <i class="pi pi-spin pi-spinner mr-2"></i> Processing...
          </template>
          <template v-else> Process Shipment </template>
        </Button>

        <Button
          @click="toggleShipment"
          class="w-full max-w-xs mt-4 items-center justify-center text-white py-2 px-6 bg-red-800"
        >
          Cancel
        </Button>
      </div>
    </Dialog>
    <DialogComponent
      v-if="showDialog"
      :dialogVisible="showDialog"
      @close-dialog="toggleDialog"
      title="Help Menu"
      :images="[
        { src: '/Members/Photos/manager dashboard.png', alt: 'Alternative Image 1' },
        { src: '/Members/Photos/manager dashboard (Sidebar).png', alt: 'Alternative Image 2' },
        { src: '/Members/Photos/edit-user.png', alt: 'Alternative Image 3' },
        {
          src: '/Members/Photos/manager dashboard (Tracking page).png',
          alt: 'Alternative Image 4'
        },
        {
          src: '/Members/Photos/manager dashboard (Shipments page).png',
          alt: 'Alternative Image 5'
        }
      ]"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
    />
  </div>
  <Toast />
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Papa from 'papaparse'
import DialogComponent from '@/components/DialogComponent.vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { supabase } from '@/supabase.js' // Import the Supabase client

const toast = useToast()

const isDark = useDark()
const toggleDark = useToggle(isDark) // Proper toggle function
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

        // Check number of columns, data types, and dimension restrictions
        for (let i = 1; i < results.data.length; i++) {
          const row = results.data[i]
          if (row.length !== 7) {
            reject(`Invalid CSV format: Row ${i + 1} has ${row.length} columns instead of 7`)
            return
          }

          // Check data types and dimension restrictions
          const [id, width, length, height, weight, volume, location] = row.map(Number)

          if (
            isNaN(id) || // ID
            isNaN(width) || // Width
            isNaN(length) || // Length
            isNaN(height) || // Height
            isNaN(weight) || // Weight
            isNaN(volume) || // Volume
            !row[6] ||
            typeof row[6] !== 'string' // Location
          ) {
            reject(
              `Invalid data in row ${i + 1}: All columns except Location must be numbers, and Location must be a non-empty string`
            )
            return
          }

          // Check dimension restrictions
          if (
            width < 200 ||
            width > 1200 ||
            length < 200 ||
            length > 1200 ||
            height < 200 ||
            height > 1200 ||
            weight < 0 ||
            weight > 2500
          ) {
            reject(
              `Invalid dimensions in row ${i + 1}: Width, Length, Height, and Weight must be between 200 and 1200 cm`
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

const loading = ref(false)

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
  loading.value = true

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
      loading.value = false
      toggleShipment()
      toast.add({
        severity: 'info',
        summary: 'Please note:',
        detail: 'Order is being processed, please wait',
        life: 4000
      })
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
            toast.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Shipments and packages inserted successfully',
              life: 4000
            })

            const { data: deleteResponse, error: deleteError } = await supabase.functions.invoke('core', {
              body: JSON.stringify({ type: 'deleteFile', fileName: selectedFile.value.name }),
              method: 'POST'
            });

            if (deleteError) {
              console.error('Error deleting the CSV file:', deleteError);
            }

          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing file:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
      life: 10000
    })
    selectedFile.value = null
    return
  } finally {
    loading.value = false
  }
}
const activeRoute = ref(router.currentRoute.value.name)
watch(
  () => router.currentRoute.value,
  (newRoute) => {
    activeRoute.value = newRoute.name || newRoute.path.split('/')[1]
  }
)

const navigate = (route) => {
  router.push(route)
  activeRoute.value = route.name || route.split('/')[1]
}
const items = computed(() => [
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-clipboard',
    route: 'dashboard',
    active: activeRoute.value === 'dashboard'
  },
  {
    label: 'Shipments',
    icon: 'pi pi-fw pi-truck',
    route: '/shipments',
    active: activeRoute.value === 'shipments'
  },
  {
    label: 'Inventory',
    icon: 'pi pi-fw pi-box',
    route: '/inventory',
    active: activeRoute.value === 'inventory'
  },
  {
    label: 'Tracking',
    icon: 'pi pi-fw pi-map',
    route: 'tracking',
    active: activeRoute.value === 'tracking'
  },

  {
    label: 'Manage Users',
    icon: 'pi pi-fw pi-lock',
    route: 'manage-users',
    active: activeRoute.value === 'manage-users'
  },
  {
    label: isDark.value ? 'Light Mode' : 'Dark Mode',
    icon: isDark.value ? 'pi pi-fw pi-sun' : 'pi pi-fw pi-moon',
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
])
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

.dark .p-menuitem.p-focus > .p-menuitem-content {
  background-color: #262626 !important;
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
.light .active-menu-item {
  background-color: #e1e1e1 !important;
  border-radius: 1rem;
}
.dark .active-menu-item {
  background-color: #262626 !important;
  border-radius: 1rem;
}

.light .active-menu-item:hover,
.dark .active-menu-item:hover {
  background-color: #a58ffe !important;
}

.light .p-menuitem.p-focus > .p-menuitem-content:not(:hover) {
  background: #e1e1e1 !important;
}
.dark .p-menuitem.p-focus > .p-menuitem-content:not(:hover) {
  background: #262626 !important;
}
.specific-container .p-menuitem {
  border-radius: 1rem;
}

.specific-container .p-menu {
  background-color: transparent !important;
}

.light .p-menu {
  color: black;
  background-color: #0a0a0a;
}

.light .p-menuitem {
  color: black;
}

.light .p-menu-list {
  color: rgba(0, 0, 0, 0.87) !important;
  stroke: black !important;
  fill: black !important;
  background-color: transparent !important;
}

.light a {
  color: black !important;
}

.light .p-menu {
  padding: 0.5rem 0;
  background: transparent;
}

.main-sidebar .light {
  background-color: transparent !important;
  color: black;
}

.p-menu {
  padding: 0.5rem 0;
  color: rgba(255, 255, 255, 0.87);
  border-radius: 4px;
  min-width: 12.5rem;
}
.dark .p-menu {
  padding: 0.5rem 0;
  background: transparent;
}

.p-menu {
  padding: 0.5rem 0;
  background: transparent;
}

.light .p-menuitem:hover > .p-menuitem-content {
  background-color: #262626 !important;
  border-radius: 1rem;
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
  background-color: #e4e4e4 !important;
  border-radius: 1rem;
}

.light .p-menuitem:not(.active-menu-item):hover > .p-menuitem-content span {
  color: black !important;
}

.light p-fileupload p-fileupload-advanced p-component {
  background-color: transparent !important;
}

.dark p-fileupload p-fileupload-advanced p-component {
  background-color: transparent !important;
}
.dark .p-fileupload .p-fileupload-buttonbar,
.dark .p-fileupload .p-fileupload-content {
  background-color: transparent !important;
  font: white;
  color: white;
}

.light .p-fileupload .p-fileupload-buttonbar,
.light .p-fileupload .p-fileupload-content {
  background-color: transparent !important;
  color: black;
}

.light p-fileupload-upload-button {
  background-color: red !important;
}

.light p-fileupload-upload-button {
  background-color: red !important;
  color: red !important;
}

.light .p-fileupload .p-button {
  background-color: #0a0a0a !important;
  color: white;
}

.light .p-fileupload .p-button .p-disabled {
  background-color: #262626 !important;
  color: rgb(255, 0, 0);
  border: 1px;
  border-color: black;
}
.light .p-button .p-button-label {
  color: rgb(186, 185, 185);
  border: 1px;
  border-color: black;
}

.light .p-icon {
  display: inline-block;
  color: rgb(186, 185, 185);
}

.light .p-fileupload-upload-button {
  padding: 10px;
}

.p-dialog-mask.p-component-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.p-dialog {
  max-height: 100vh;
  overflow-y: auto;
}
</style>

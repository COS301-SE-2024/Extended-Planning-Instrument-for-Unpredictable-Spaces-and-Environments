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
              :class="[
                'h-[45px] flex align-items-center mb-2',
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
              'h-[45px] flex align-items-center mb-2 ',
              item.active ? 'active-menu-item' : ''
            ]"
            v-bind="props.action"
            :target="item.target"
            :href="item.url"
            @click="item.command"
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
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'
import DialogComponent from '@/components/DialogComponent.vue'

// Initialize Supabase client
const supabaseUrl = 'https://rgisazefakhdieigrylb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNjMxMzE1MSwiZXhwIjoyMDMxODg5MTUxfQ.ctQmfWfRjY77afjwWuynIL4lRdjrtBD7Xqh75SxQBeo'
const supabase = createClient(supabaseUrl, supabaseKey)

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
    alert('Please select a file')
    return
  }

  try {
    console.log('Uploading file:', selectedFile.value.name)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('data_bucket')
      .upload(`uploads/${selectedFile.value.name}`, selectedFile.value)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      alert('Failed to upload file')
      return
    }

    console.log('File uploaded successfully:', uploadData)

    const { data: publicURLData, error: urlError } = supabase.storage
      .from('data_bucket')
      .getPublicUrl(`uploads/${selectedFile.value.name}`)

    if (urlError) {
      console.error('Error getting public URL:', urlError)
      alert('Failed to get public URL')
      return
    }

    const publicURL = publicURLData.publicUrl
    console.log('Generated Public URL:', publicURL)

    // Try to get the file using the Supabase client instead of fetch
    const { data, error: downloadError } = await supabase.storage
      .from('data_bucket')
      .download(`uploads/${selectedFile.value.name}`)

    if (downloadError) {
      console.error('Error downloading file:', downloadError)
      alert('Failed to download file')
      return
    }

    const csvText = await data.text()
    console.log('CSV Text (first 100 characters):', csvText.substring(0, 100))

    Papa.parse(csvText, {
      header: true,
      complete: async (results) => {
        const rows = results.data

        // Fetch the highest Delivery_id and increment by one
        const { data: maxDeliveryData, error: maxDeliveryError } = await supabase
          .from('Deliveries')
          .select('id')
          .order('id', { ascending: false })
          .limit(1)

        if (maxDeliveryError) {
          console.error('Error fetching max delivery ID:', maxDeliveryError)
          alert('Failed to fetch max delivery ID')
          return
        }

        const newDeliveryId = maxDeliveryData.length > 0 ? maxDeliveryData[0].id + 1 : 1
        console.log('New Delivery ID:', newDeliveryId)

        // Insert a new delivery into the Deliveries table
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('Deliveries')
          .insert([{ id: newDeliveryId, Status: 'Ordered', Driver_id: '55' }])
          .select('id')

        if (deliveryError) {
          console.error('Error inserting delivery:', deliveryError)
          alert('Failed to insert delivery')
          return
        }

        // Group rows by location and insert into Shipments and Packages tables
        const groupedByLocation = rows.reduce((acc, row) => {
          if (!acc[row.Location]) {
            acc[row.Location] = []
          }
          acc[row.Location].push(row)
          return acc
        }, {})

        for (const location in groupedByLocation) {
          const shipmentRows = groupedByLocation[location]

          // Insert a new shipment into the Shipment table
          const { data: shipmentData, error: shipmentError } = await supabase
            .from('Shipment')
            .insert([
              {
                Start_time: null,
                Destination: location,
                Status: 'Processing',
                Delivery_id: newDeliveryId
              }
            ])
            .select('id')

          if (shipmentError) {
            console.error('Error inserting shipment:', shipmentError)
            alert('Failed to insert shipment')
            return
          }

          // Fetch the highest Delivery_id and increment by one
          const { data: maxShipmentData, error: maxShipmentError } = await supabase
            .from('Shipment')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)

          if (maxShipmentError) {
            console.error('Error fetching max delivery ID:', maxShipmentError)
            alert('Failed to fetch max delivery ID')
            return
          }

          const newShipmentId = maxShipmentData.length > 0 ? maxShipmentData[0].id + 1 : 1
          console.log('New Shipment ID:', newShipmentId)

          //DO THE SAME FOR PACKAGES

          // Insert packages into the Packages table
          const packages = shipmentRows.map((row) => ({
            Shipment_id: newShipmentId,
            Width: parseFloat(row['Width (mm)']),
            Length: parseFloat(row.Length),
            Height: parseFloat(row.Height),
            Weight: parseFloat(row['Weight (kg)']),
            Volume: parseFloat(row.Volume)
          }))

          const { error: packageError } = await supabase.from('Packages').insert(packages)

          if (packageError) {
            console.error('Error inserting packages:', packageError)
            alert('Failed to insert packages')
            return
          }
        }

        alert('File processed and data inserted successfully')
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
      }
    })
  } catch (error) {
    console.error('Error processing file:', error)
    alert('Error processing file')
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
    label: 'Tracking',
    icon: 'pi pi-fw pi-map',
    route: 'tracking',
    active: activeRoute.value === 'tracking'
  },
  {
    label: 'Inventory',
    icon: 'pi pi-fw pi-box',
    route: '/inventory',
    active: activeRoute.value === 'inventory'
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
      console.log('Toggling Dark Mode')
      toggleDark()
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
  border-radius: 1rem;
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
  background-color: #8b5cf6 !important;
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
  background-color: white;
}

.light a {
  color: black !important;
}

.p-menu {
  padding: 0.5rem 0;
  color: rgba(255, 255, 255, 0.87);
  border-radius: 4px;
  min-width: 12.5rem;
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
</style>

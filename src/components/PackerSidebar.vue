<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { createPDF } from '@/QRcodeGenerator'
import { FilterMatchMode } from 'primevue/api'
import { isLoading, useToggleDialog } from './packerDialog'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'
import DialogComponent from '@/components/DialogComponent.vue'
import { debounce } from 'lodash'

const containerDimensions = [1200, 1930, 1000]

const showHelpDialog = ref(false)
const toggleDialogHelp = () => {
  showHelpDialog.value = !showHelpDialog.value
}
const packingResults = ref({})
const shipmentsToPack = ref(null)
const showShipmentSelection = ref(false)

const toast = useToast()

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  shipmentId: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const onFilterChange = (type, value) => {
  filters.value[type].value = value
}
const debouncedHardReload = debounce(hardReload, 300)

const filteredShipments = computed(() => {
  return DeliveriesByProcessing.value.filter((shipment) => {
    const globalMatch =
      !filters.value.global.value ||
      (typeof shipment.id === 'number' && String(shipment.id).includes(filters.value.global.value))
    const shipmentIdMatch =
      !filters.value.shipmentId.value ||
      (typeof shipment.id === 'number' &&
        String(shipment.id).includes(filters.value.shipmentId.value))
    return globalMatch && shipmentIdMatch
  })
})

const isDark = useDark()
const toggleDark = useToggle(isDark) // Proper toggle function
const router = useRouter() // Use the router instance
// const dialogVisible = ref(false)

const { dialogVisible, showStartPackingOvererlay, toggleStartNewPacking, toggleDialog } =
  useToggleDialog()

const { loadingShipments, startLoading, stopLoading } = isLoading()

onMounted(() => {
  setupSubscription()
  loadProgress()
})

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  } else {
    router.push({ name: 'login' })
  }
}

const emit = defineEmits(['handle-json', 'shipments-loaded'])

//API CALLS FOR SHIPMENTS
const DeliveriesByProcessing = ref([])
const getAllProcessing = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getDeliveriesByProcessing' }),
      method: 'POST'
    })
    if (error) {
      console.error('API Error:', error)
    } else {
      DeliveriesByProcessing.value = data.data
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

async function setupSubscription() {
  try {
    await supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Deliveries' }, () => {
        getAllProcessing()
      })
      .subscribe()
  } catch (error) {
    console.error('Failed to fetch all shipped deliveries')
  }
}

const updateShipmentStatus = async (shipmentID, status) => {
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentStatus',
        shipmentId: shipmentID,
        newStatus: status
      }),
      method: 'POST'
    })
    if (error) {
      console.error(`API Error for updating Status for shipment ${shipmentID}:`, error)
    }
  } catch (error) {
    console.error(`API Error for updating Status for shipment ${shipmentID}:`, error)
  }
}

const updateDeliveryStatus = async (deliveryID, status) => {
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateDeliveryStatus',
        deliveryId: deliveryID,
        newStatus: status
      }),
      method: 'POST'
    })
    if (error) {
      console.error(`API Error for updating Status for delivery ${deliveryID}:`, error)
    }
  } catch (error) {
    console.error(`API Error for updating Status for delivery ${deliveryID}:`, error)
  }
}

const updateShipmentStartTime = async (shipmentID) => {
  const currentDateTime = new Date()
  const formattedTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ')
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentStartTime',
        shipmentId: shipmentID,
        newStartTime: formattedTime
      }),
      method: 'POST'
    })
    if (error) {
      console.error(`API Error for updating Start Time for shipment ${shipmentID}:`, error)
    }
  } catch (error) {
    console.error(`API Error for updating Status for shipment ${shipmentID}:`, error)
  }
}

const items = [
  {
    label: 'Start New Shipment',
    icon: 'pi pi-fw pi-clipboard',
    command: () => {
      if (showStartPackingOvererlay.value) {
        toggleDialog()
        getAllProcessing()
      } else {
        toast.add({
          severity: 'warn',
          summary: 'Action Disabled',
          detail: 'You cant start a new shipment until the active shipment is complete',
          life: 3000
        })
      }
    },
    disabled: !showStartPackingOvererlay.value
  },

  {
    label: 'Dark Mode Toggle',
    icon: 'pi pi-fw pi-moon',
    command: () => {
      toggleDark() // Correctly call the toggle function
    }
  },
  {
    label: 'Print Shipment list',
    icon: 'pi pi-fw pi-qrcode',
    command: () => {
      printQRcode()
    }
  },
  {
    label: 'Log Out',
    icon: 'pi pi-fw pi-sign-out',
    command: () => {
      console.info('Logging Out')
      logout()
    }
  },
  {
    label: 'Help',
    icon: 'pi pi-fw pi-question',
    command: () => {
      showHelpDialog.value = !showHelpDialog.value
    }
  },
  {
    label: 'Clear Cache',
    icon: 'pi pi-fw pi-refresh',
    command: () => {
      debouncedHardReload()
    }
  }
]

function hardReload() {
  const userConfirmed = window.confirm(
    'Are you sure you want to reload the page? All current shipment progress will be lost!'
  )

  if (userConfirmed) {
    localStorage.removeItem('packingProgress')
    localStorage.removeItem('printingStorage')

    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
}

function loadProgress() {
  const savedProgress = localStorage.getItem('packingProgress')
  const printingProgress = localStorage.getItem('printingStorage')
  if (savedProgress && printingProgress) {
    const progressData = JSON.parse(savedProgress)
    const printData = JSON.parse(printingProgress)
    packingResults.value = printData.packingResults
    shipmentsToPack.value = progressData.shipments
    return true
  }
  return false
}

function saveProgress() {
  localStorage.removeItem('printingStorage')
  const progressData = {
    packingResults: packingResults.value
  }
  localStorage.setItem('printingStorage', JSON.stringify(progressData))
}

function printQRcode() {
  if (Object.keys(packingResults.value).length === 0) {
    toast.add({
      severity: 'error',
      summary: 'No Delivery has been selected to Pack',
      detail: 'You need to choose a delivery to pack before you can print the QR codes ',
      life: 3000
    })
    return
  }
  showShipmentSelection.value = true
}

async function printSelectedShipment(shipmentId) {
  const selectedResult = packingResults.value[shipmentId]
  if (selectedResult) {
    await createPDF(selectedResult, `Shipment_#${shipmentId}`)
    showShipmentSelection.value = false
  } else {
    console.error(`No packing result found for shipment ${shipmentId}`)
  }
}
async function fetchShipmentsFromDelivery(DeliveryID) {
  startLoading()
  toggleDialog()

  updateDeliveryStatus(DeliveryID, 'Processing')
  const { data, error } = await supabase.functions.invoke('core', {
    body: JSON.stringify({
      type: 'getShipmentByDeliveryID',
      deliveryID: DeliveryID
    }),
    method: 'POST'
  })
  if (!data || !data.data || data.data.length === 0) {
    console.error('No Shipments related to that delivery ID', error)
    return
  }

  shipmentsToPack.value = data.data
  emit('shipmentsLoaded', shipmentsToPack.value)
  for (const shipment of shipmentsToPack.value) {
    await runPackingAlgo(shipment.id)
    updateShipmentStatus(shipment.id, 'Processing')
    updateShipmentStartTime(shipment.id)
  }
  saveProgress()
  stopLoading()
}

const runPackingAlgo = async (shipmentId) => {
  try {
    const { data: response } = await supabase.functions.invoke('packing', {
      body: JSON.stringify({
        type: 'fetchSolution',
        shipmentId: shipmentId
      }),
      method: 'POST'
    })
    if (response.error) {
      console.warn('No saved solution Calculating solution')
      await uploadSolution(shipmentId, containerDimensions)
    } else {
      if (response && response.data && response.data.boxes) {
        packingResults.value[shipmentId] = response.data.boxes
        emit('handle-json', JSON.parse(JSON.stringify(packingResults.value[shipmentId])))
      } else if (response && response.data && response.data.data.boxes) {
        packingResults.value[shipmentId] = response.data.data.boxes
        emit('handle-json', JSON.parse(JSON.stringify(packingResults.value[shipmentId])))
      } else {
        console.error('Invalid or missing data in the response')
        return
      }
    }
  } catch (e) {
    console.error('Failure to fetch solution', e)
  }
}

async function uploadSolution(shipmentId, containerDimensions) {
  try {
    const { data, error } = await supabase.functions.invoke('packing', {
      body: JSON.stringify({
        type: 'getPackages',
        ShipmentID: shipmentId
      }),
      method: 'POST'
    })

    if (error) {
      console.error('Error fetching packages for shipment: ', error)
      return
    }

    if (!data || !data.data) {
      console.error('Invalid data structure received:', data)
      return
    }

    const response = geneticAlgorithm(data.data, containerDimensions, 150, 300, 0.01)
    if (response.data.boxes.length == 0) {
      console.error('Failed to calculate solution')
      return
    } else {
      const { error: errorSaving } = await supabase.functions.invoke('packing', {
        body: JSON.stringify({
          type: 'uploadSolution',
          shipmentId: shipmentId,
          jsonObject: response
        }),
        method: 'POST'
      })
      if (errorSaving) {
        console.error('Failed to store solution')
      } else {
        const { error: updateError } = await supabase.functions.invoke('packing', {
          body: JSON.stringify({
            type: 'updateFitnessValue',
            ShipmentId: parseInt(shipmentId),
            newFitnessValue: parseFloat(response.fitness)
          }),
          method: 'POST'
        })

        if (updateError) {
          console.error('ERROR UPDATING FITNESS VALUE: ', updateError)
        }

        const reviewedSoln = MarkUnplacedBoxes(data.data, response.data.boxes)

        packingResults.value[shipmentId] = reviewedSoln
        emit('handle-json', JSON.parse(JSON.stringify(packingResults.value[shipmentId])))
      }
    }
  } catch (error) {
    console.error('Error in getSolution:', error)
  }
}

const handleSelectShipment = (deliveryID) => {
  fetchShipmentsFromDelivery(deliveryID)
  toggleStartNewPacking()
}

function MarkUnplacedBoxes(AllBoxes, SolutionBoxes) {
  // Create a Set of placed box IDs for quick lookup
  const placedBoxIds = new Set(SolutionBoxes.map((box) => box.id))

  return SolutionBoxes.map((box) => ({
    ...box,
    isPlaced: placedBoxIds.has(box.id)
  }))
}

onMounted(() => {
  getAllProcessing()
})
</script>

<template>
  <div :class="[isDark ? 'dark packer-sidebar' : 'light packer-sidebar', 'h-full']">
    <Menubar :model="items" class="w-full specific-menubar v-1">
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
        <a
          v-bind="props.action"
          :class="{ 'disabled-link': !showStartPackingOvererlay }"
          @click="item.command()"
        >
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
    </Menubar>
    <Dialog
      v-model:visible="showShipmentSelection"
      header="Select Shipment to Print"
      :modal="true"
      :closable="true"
      class="w-[50%]"
    >
      <div class="flex flex-wrap justify-center gap-4 m-2">
        <Button
          v-for="shipmentId in Object.keys(packingResults)"
          :key="shipmentId"
          :label="`Print Shipment #${shipmentId}`"
          class="my-4 px-4 py-2 bg-orange-500 text-gray-100 rounded-lg flex items-center"
          @click="printSelectedShipment(shipmentId)"
        />
      </div>
      <div class="flex flex-wrap justify-center">
        <Button
          @click="showShipmentSelection = !showShipmentSelection"
          class="text-lg text-gray-100 justify-center px-4 py-2 w-full rounded-lg bg-red-600"
          >Close</Button
        >
      </div>
    </Dialog>

    <Dialog
      header="Select Current Shipment"
      v-model:visible="dialogVisible"
      :modal="true"
      :closable="false"
      class="z-9999 w-full h-screen sm:h-auto sm:w-[500px] mx-auto p-4"
    >
      <div
        :class="[isDark ? ' text-white border-white' : ' text-black border-black', 'border-b-2']"
        class="mb-4"
      >
        <div class="w-full md:w-[300px] mb-4 sm">
          <div
            :class="[
              isDark
                ? 'border-neutral-500 bg-neutral-900 text-white'
                : 'border-gray-500 bg-white text-black',
              'border flex items-center px-4 py-2 rounded-xl mt-4'
            ]"
          >
            <i :class="[isDark ? 'text-white' : 'text-black', 'pi pi-search mr-2']"></i>
            <InputText
              v-model="filters.shipmentId.value"
              placeholder="Search by Shipment ID"
              @input="onFilterChange('deliveryId', $event.target.value)"
              type="number"
              :class="[
                isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black',
                'focus:outline-none focus:ring-0'
              ]"
            />
          </div>
        </div>
        <p class="text-3xl mb-2">Current Shipments:</p>
      </div>
      <div v-if="loadingShipments">Loading shipments...</div>
      <div v-else-if="errorMessage">{{ errorMessage }}</div>
      <div v-else class="pb-12">
        <!-- Adjust padding to avoid overlap -->
        <div v-for="shipment in filteredShipments" :key="shipment.id" class="mb-8">
          <p class="text-neutral-400 text-lg">Delivery Status:</p>
          <p class="text-lg">{{ shipment.Status }}</p>
          <p class="text-neutral-500 text-lg">Delivery ID:</p>
          <p class="text-lg">{{ shipment.id }}</p>
          <Button
            @click="handleSelectShipment(shipment.id)"
            :class="[isDark ? 'text-white' : ' text-white', 'focus:outline-none focus:ring-0']"
            class="text-lg justify-center px-4 py-2 w-full bg-green-800 mt-2"
            >Select Delivery</Button
          >
        </div>
        <div v-if="DeliveriesByProcessing.length === 0">No Deliveries found.</div>
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
    <DialogComponent
      v-if="showHelpDialog"
      :images="images"
      title="Help Menu"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
      :dialogVisible="showHelpDialog"
      @close-dialog="toggleDialogHelp"
    />
  </div>
</template>
<script>
import { getAssetURL } from '@/assetHelper'

const images = computed(() => [
  { src: getAssetURL('Photos/Help/Packer/1.png'), alt: 'Alternative Image 1' },
  { src: getAssetURL('Photos/Help/Packer/9.png'), alt: 'Alternative Image 9' },
  { src: getAssetURL('Photos/Help/Packer/8.png'), alt: 'Alternative Image 8' },
  { src: getAssetURL('Photos/Help/Packer/7.png'), alt: 'Alternative Image 7' },
  { src: getAssetURL('Photos/Help/Packer/5.png'), alt: 'Alternative Image 5' },
  { src: getAssetURL('Photos/Help/Packer/6.png'), alt: 'Alternative Image 6' },
  { src: getAssetURL('Photos/Help/Packer/4.png'), alt: 'Alternative Image 4' },
  { src: getAssetURL('Photos/Help/Packer/2.png'), alt: 'Alternative Image 2' },
  { src: getAssetURL('Photos/Help/Packer/3.png'), alt: 'Alternative Image 3' }
])
</script>
<style>
/* General styles */

.disabled-link {
  pointer-events: none;
  opacity: 0.5;
}
.mobile-icon {
  display: none;
}
.light {
  background-color: white;
  color: black;
}
.packer-sidebar .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  border-radius: 0;
  color: white;
}

.packer-sidebar.dark .p-menu {
  background-color: #0a0a0a;
  border-radius: 0;
}

.packer-sidebar.dark .p-menubar {
  background-color: #0a0a0a !important; /* Ensure dark background */
  color: rgb(0, 0, 0) !important; /* Ensure text color is white */
}

.packer-sidebar.light .p-menubar {
  background-color: #ffffff !important; /* Ensure light background */
}
.packer-sidebar.dark .p-icon {
  color: white !important; /* Ensure icon color is white in dark mode */
}

.packer-sidebar.dark .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  background-color: #0a0a0a !important; /* Dark background for menu items */
  color: white !important; /* Ensure text color is white */
}
.packer-sidebar.dark .p-menubar .p-menubar-root-list > .p-menuitem:hover > .p-menuitem-content {
  background-color: #262626 !important; /* Darker background on hover */
  color: white !important;
}
.packer-sidebar.dark .p-menuitem {
  &.p-focus > .p-menuitem-content {
    background-color: #262626 !important;
  }
}
.packer-sidebar.dark .p-menuitem:hover > .p-menuitem-content {
  background-color: #262626 !important;
}

/* Additional styles scoped to the packer-sidebar component */
.packer-sidebar .p-calendar {
  width: 100%; /* Take up full width of parent */
  height: auto;
}

.packer-sidebar .p-chart {
  height: auto;
}

.packer-sidebar .light .p-menu {
  color: black;
  background-color: #0a0a0a;
}

.packer-sidebar .light .p-menuitem {
  color: black;
}

.packer-sidebar .dark .p-menubar {
  padding: 1rem;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.87);
}

.packer-sidebar .p-menubar {
  padding: 1rem;
  background: #ffffff;
  color: rgba(255, 255, 255, 0.87);
}

.packer-sidebar .p-icon {
  display: inline-block;
  color: #0a0a0a;
}

.packer-sidebar .light .p-menu-list {
  color: rgba(0, 0, 0, 0.87) !important;
  stroke: black !important;
  fill: black !important;
  background-color: white;
  background: transparent;
}

.packer-sidebar .dark .a {
  color: white !important;
}

.packer-sidebar .a {
  color: white !important;
}

.packer-sidebar .p-menu {
  padding: 0.5rem 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.87);
}

.packer-sidebar .dark .p-menu {
  padding: 0.5rem 0;
  background: transparent;
}

.packer-sidebar .light .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  transition: none;
  background: white;
  border-bottom: 0.1px solid rgb(74, 74, 74); /* Only apply a border to the bottom */
  color: black;
}

.packer-sidebar .dark .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  transition: none;
  background: #0a0a0a;
  border-bottom: 0.1px solid rgb(74, 74, 74); /* Only apply a border to the bottom */
  color: white;
}

.packer-sidebar .dark .p-icon {
  display: inline-block;
  color: #ffffff;
}

.packer-sidebar .light .p-menuitem {
  &.p-focus > .p-menuitem-content {
    background-color: #f3f4f6 !important;
    color: black;

    span {
      color: black !important;
    }
  }
}

.packer-sidebar .light .p-menuitem:hover > .p-menuitem-content {
  background-color: #a16207 !important;
  color: white !important;

  span {
    color: white !important;
  }
}
</style>

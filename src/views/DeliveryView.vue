<script setup>
import { useDark } from '@vueuse/core'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import DeliverySidebar from '@/components/DeliverySidebar.vue'
import Map from '@/components/Map.vue'
import { supabase } from '@/supabase'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import CryptoJS from 'crypto-js'
import { useToast } from 'primevue/usetoast'
import Loading from './Loading.vue'
const isDark = useDark()
const toast = useToast()

const showStartNewDeliveryOverlay = ref(true)
const isLoading = ref(false)
const currentShipmentDetails = ref(null)

const dialogVisible = ref(false)
const dialogPopUpVisible = ref(false)
const mapDestination = ref(null)

const toggleDialog = () => {
  dialogVisible.value = !dialogVisible.value
}
function saveDeliveryProgress() {
  const deliveryData = {
    currentDelivery: currentDelivery.value,
    shipmentsByDelivery: shipmentsByDelivery.value,
    pendingLocations: pendingLocations.value,
    currentDestination: currentDestination.value,
    timelineEvents: timelineEvents.value,
    activeShipmentIndex: activeShipmentIndex.value
  }
  localStorage.setItem('deliveryProgress', JSON.stringify(deliveryData))
}

const togglePopUpDialog = () => {
  dialogPopUpVisible.value = !dialogPopUpVisible.value
}

const shipmentsByDelivery = ref([])
const pendingLocations = ref([])

const currentDestination = ref('')
const deliveries = ref([])

const activeShipmentIndex = ref(0)

const timelineEvents = ref([])

const isSmallScreen = ref(window.innerWidth < 768)
const layoutClass = computed(() => (isSmallScreen.value ? 'vertical' : 'horizontal'))

const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 768
}

const confirmedShipments = ref(new Set())
const selectedShipmentId = ref(null)
const signaturePad = ref(null)
let google = null

async function sortLocationsByDistance(origins, destinations) {
  if (!google) {
    google = window.google
  }
  const service = new google.maps.DistanceMatrixService()
  const request = {
    origins: [origins],
    destinations: destinations,
    travelMode: google.maps.TravelMode.DRIVING
  }

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(request, (response, status) => {
      if (status === google.maps.DistanceMatrixStatus.OK) {
        const distanceList = []
        for (let i = 0; i < response.rows[0].elements.length; i++) {
          const distance = response.rows[0].elements[i].distance.value // distance in meters
          distanceList.push([destinations[i], distance])
        }
        // Sort by distance (ascending)
        distanceList.sort((a, b) => a[1] - b[1])
        resolve(distanceList.map(([location]) => location))
      } else {
        reject(`Error: ${status}`)
      }
    })
  })
}

const getShipmentByDeliveryId = async () => {
  try {
    showStartNewDeliveryOverlay.value = false
    isLoading.value = true
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'getShipmentByDeliveryID',
        deliveryID: currentDelivery.value.id
      }),
      method: 'POST'
    })
    if (error) {
      console.log(`API Error for delivery ${currentDelivery.value.id}:`, error)
    } else {
      console.log(data)

      if (!shipmentsByDelivery.value[currentDelivery.value.id]) {
        shipmentsByDelivery.value[currentDelivery.value.id] = []
      }

      const destinations = data.data.map((shipment) => shipment.Destination)
      const origin = 'University of Pretoria'

      const sortedLocations = await sortLocationsByDistance(origin, destinations)
      const sortedShipments = sortedLocations.map((location) => {
        return data.data.find((shipment) => shipment.Destination === location)
      })

      console.log('sortedShipments', sortedShipments)
      shipmentsByDelivery.value[currentDelivery.value.id] = sortedShipments

      if (sortedLocations.length > 0) {
        mapDestination.value = sortedLocations[0]
      }

      identifyPendingLocations()
      updateTimelineEvents()

      saveDeliveryProgress()
      isLoading.value = false
    }
  } catch (error) {
    console.error(
      `Error fetching shipments for delivery ${currentDelivery.value.id} or there are no shipments associated with this delivery:`,
      error
    )
    showStartNewDeliveryOverlay.value = true
  }
}

const identifyPendingLocations = () => {
  const allLocations = Object.values(shipmentsByDelivery.value)
    .flat()
    .map((shipment) => shipment.Destination)
    .filter(Boolean)

  pendingLocations.value = [...new Set(allLocations)]
  if (pendingLocations.value.length > 0) {
    currentDestination.value = pendingLocations.value[0]
  }
  console.log('pending locations')
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'shipped':
      return '#d97706'
    case 'processing':
      return '#6b7280'
    case 'delivered':
      return '#14532d'
    default:
      return '#6b7280'
  }
}

const currentDelivery = ref(null)

const handleDeliveryFromSidebar = (delivery) => {
  // If delivery is a ref, we need to access its value
  currentDelivery.value = delivery._isRef ? delivery.value : delivery

  getShipmentByDeliveryId()
  // Trigger timeline update
  updateTimeline()
}

const upDateShipmentStatus = async (shipmentId) => {
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentStatus',
        shipmentId: shipmentId,
        newStatus: 'Delivered'
      }),
      method: 'POST'
    })
    if (error) {
      console.log(`API Error for delivery ${currentDelivery.value.id}:`, error)
    }
  } catch (error) {
    console.error(`Error fetching shipments for delivery ${currentDelivery.value.id}:`, error)
  }
}

const updateShipmentStartTime = async (shipmentID) => {
  const currentDate = new Date().toISOString()

  const { error } = await supabase.functions.invoke('core', {
    body: JSON.stringify({
      type: 'updateShipmentStartTime',
      deliveryId: shipmentID,
      newEndTime: currentDate
    }),
    method: 'POST'
  })
  if (error) {
    console.error(`API Error for updating EndTime for delivery`, error)
  }
}

const encryptionKey = import.meta.env.ENCRYPTION_KEY
const uploadSignature = async (signature, shipmentID) => {
  try {
    // Encrypt the signature
    const encryptedSignature = encryptData(signature, encryptionKey)
    // Call the API function to upload the signature
    const { error: uploadError } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'uploadSignature',
        dataURL: encryptedSignature
      }),
      method: 'POST'
    })

    if (uploadError) {
      console.error('API Error for uploading signature:', uploadError)
      return
    }

    // Update the shipment end time after successful upload
    const currentDate = new Date().toISOString()
    const { error: updateError } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentEndTime',
        deliveryId: shipmentID,
        newEndTime: currentDate
      }),
      method: 'POST'
    })

    if (updateError) {
      console.error('API Error for updating EndTime for delivery:', updateError)
    }
  } catch (error) {
    console.error('Error uploading signature or updating shipment:', error)
  }
}

// Helper function to encrypt data
function encryptData(data, key) {
  return CryptoJS.AES.encrypt(data, key).toString()
}

const openDialog = (item) => {
  dialogVisible.value = true
  selectedShipmentId.value = item.shipment_id
  currentShipmentDetails.value = {
    id: item.shipment_id,
    destination: item.destination,
    status: item.status
  }
}
const completeDelivery = async () => {
  try {
    await addDeliveryEndTime()
    await updateDeliveryStatus()
    toast.add({
      severity: 'success',
      summary: 'All Destinations Visited',
      detail: 'All destinations successfully visited, routing you home',
      life: 3000
    })

    localStorage.removeItem('deliveryProgress')
    showStartNewDeliveryOverlay.value = true
  } catch (error) {
    console.error('Error completing delivery:', error)
  }
}

const addDeliveryEndTime = async () => {
  try {
    const currentDate = new Date().toISOString()
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateDeliveryEndTime',
        deliveryId: currentDelivery.value.id,
        newStartTime: currentDate
      }),
      method: 'POST'
    })
    if (error) {
      console.log('API Error Adding start time to delivery:', error)
    }
  } catch (error) {
    console.error('Error fetching data from updateDeliveryStartTime:', error)
  }
}

const updateDeliveryStatus = async () => {
  try {
    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateDeliveryStatus',
        deliveryId: currentDelivery.value.id,
        newStatus: 'Completed'
      }),
      method: 'POST'
    })
    if (error) {
      console.log('API Error updating delivery status:', error)
    }
  } catch (error) {
    console.error('Error updating delivery status', error)
  }
}

function save(shipmentid) {
  if (signaturePad.value) {
    const { data } = signaturePad.value.saveSignature()
    uploadSignature(data, shipmentid)

    // Update the current shipment status
    upDateShipmentStatus(shipmentid)

    // Find the next undelivered shipment
    const nextUndeliveredIndex = timelineEvents.value.findIndex(
      (event, index) => index > activeShipmentIndex.value && event.status !== 'Delivered'
    )

    if (nextUndeliveredIndex !== -1) {
      // Move to the next undelivered shipment
      activeShipmentIndex.value = nextUndeliveredIndex
      currentDestination.value = timelineEvents.value[nextUndeliveredIndex].destination
      mapDestination.value = currentDestination.value

      // Update the start time for the next shipment
      updateShipmentStartTime(timelineEvents.value[nextUndeliveredIndex].shipment_id)
    } else {
      // All shipments are delivered
      currentDestination.value = ''
      mapDestination.value = 'University of Pretoria'

      // Complete the delivery
      completeDelivery()
    }

    confirmedShipments.value.add(shipmentid)
    toggleDialog()

    // Save the updated delivery progress
    saveDeliveryProgress()
  } else {
    console.error('Signature pad ref is not available')
  }
}

async function setupSubscription() {
  await supabase // Await for the subscription to be established
    .channel('*')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Shipment' }, (payload) => {
      updateTimelineEvent(payload.new)
    })
    .subscribe()
}

const updateTimelineEvent = (updatedShipment) => {
  const index = timelineEvents.value.findIndex((event) => event.shipment_id === updatedShipment.id)
  if (index !== -1) {
    const newStatus = updatedShipment.Status
    const newColor = getStatusColor(newStatus)

    // Update the current event
    timelineEvents.value[index] = {
      ...timelineEvents.value[index],
      status: newStatus,
      color: newColor
    }

    // Update the current event's line_colour (for the connector below it)
    if (index < timelineEvents.value.length - 1) {
      timelineEvents.value[index] = {
        ...timelineEvents.value[index],
        line_colour: newColor
      }
    }

    // Force Vue to react to the change
    timelineEvents.value = [...timelineEvents.value]

    // Update currentShipmentDetails if it's the active shipment
    if (index === activeShipmentIndex.value) {
      currentShipmentDetails.value = {
        id: updatedShipment.id,
        destination: updatedShipment.Destination,
        status: newStatus
      }
    }

    // If the updated shipment is the active one and it's now delivered, move to the next
    if (index === activeShipmentIndex.value && newStatus === 'Delivered') {
      const nextUndeliveredIndex = timelineEvents.value.findIndex(
        (event, idx) => idx > activeShipmentIndex.value && event.status !== 'Delivered'
      )

      if (nextUndeliveredIndex !== -1) {
        activeShipmentIndex.value = nextUndeliveredIndex
        currentDestination.value = timelineEvents.value[nextUndeliveredIndex].destination
        mapDestination.value = currentDestination.value
      } else {
        // All shipments are delivered
        completeDelivery()
      }
    }

    // Save the updated delivery progress
    saveDeliveryProgress()
  }
}

const isPopiAccepted = ref(false)
const isPopiDialogVisible = ref(false)

const showPopiInfo = () => {
  isPopiDialogVisible.value = true
}

const startNewDelivery = () => {
  showStartNewDeliveryOverlay.value = false
  currentDelivery.value = null
  shipmentsByDelivery.value = []
  pendingLocations.value = []
  currentDestination.value = ''
  timelineEvents.value = []
  confirmedShipments.value = new Set()
  mapDestination.value = null

  saveDeliveryProgress()

  if (timelineEvents.value.length > 0) {
    const firstShipmentId = timelineEvents.value[0].shipment_id
    updateShipmentStartTime(firstShipmentId)
  }
}

const updateTimeline = () => {
  if (currentDelivery.value) {
    deliveries.value = [
      {
        status: currentDelivery.value.status || 'Unknown',
        date: new Date(),
        icon: 'pi pi-shopping-cart',
        color: '#9C27B0',
        image: 'game-controller.jpg'
      }
    ]
  }
}

const updateTimelineEvents = () => {
  const events = []
  for (const deliveryId in shipmentsByDelivery.value) {
    const shipments = shipmentsByDelivery.value[deliveryId]
    shipments.forEach((shipment, index) => {
      const status = shipment.Status || 'Unknown'
      const color = getStatusColor(status)
      events.push({
        status: status,
        time: shipment.Created_at || shipment.Start_time || 0,
        shipment_id: shipment.id,
        destination: shipment.Destination,
        delivery_id: shipment.Delivery_id,
        end_time: shipment.End_time,
        icon: 'pi pi-box',
        color: color,
        line_colour: index === shipments.length ? '#6b7280' : color,
        index: events.length
      })
    })
  }
  timelineEvents.value = events

  activeShipmentIndex.value = findFirstUndeliveredShipmentIndex()


  if (activeShipmentIndex.value === -1) {
    activeShipmentIndex.value = timelineEvents.value.length - 1
  }
}

//OPEN IN GOOGLE MAPS FUNCTONALITY
const openInGoogleMaps = () => {
  if (mapDestination.value) {
    const destination = encodeURIComponent(mapDestination.value)
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`

    // Check if the user is on a mobile device and try to open the native app
    window.open(googleMapsUrl, '_blank')
  } else {
    alert('Destination is not set')
  }
}

const findFirstUndeliveredShipmentIndex = () => {
  return timelineEvents.value.findIndex((event) => event.status !== 'Delivered')
}

onMounted(() => {
  const savedProgress = localStorage.getItem('deliveryProgress')
  if (savedProgress) {
    const deliveryData = JSON.parse(savedProgress)
    currentDelivery.value = deliveryData.currentDelivery
    shipmentsByDelivery.value = deliveryData.shipmentsByDelivery
    pendingLocations.value = deliveryData.pendingLocations
    currentDestination.value = deliveryData.currentDestination
    timelineEvents.value = deliveryData.timelineEvents

    activeShipmentIndex.value = findFirstUndeliveredShipmentIndex()

    if (activeShipmentIndex.value === -1) {
      activeShipmentIndex.value = timelineEvents.value.length - 1
    }
    showStartNewDeliveryOverlay.value = false
  } else {
    showStartNewDeliveryOverlay.value = true
  }

  window.addEventListener('resize', updateScreenSize)
  setupSubscription()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<script>
export default {
  name: 'MySignaturePad',
  data() {
    return {
      option1: {
        penColor: 'rgb(255, 255, 255)',
        backgroundColor: '#262626'
      },
      option2: {
        penColor: 'rgb(0,0,0)',
        backgroundColor: 'rgb(255, 255, 255)'
      },
      disabled: false,
      dataUrl: 'https://avatars2.githubusercontent.com/u/17644818?s=460&v=4'
    }
  },
  methods: {
    undo() {
      this.$refs.signaturePad.undoSignature()
    }
  }
}
</script>
<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-500 text-black',
      ' h-[auto] flex flex-col '
    ]"
  >
    <DeliverySidebar
      @handle-delivery="handleDeliveryFromSidebar"
      @start-new-delivery="startNewDelivery"
      v-model:dialogPopUpVisible="dialogPopUpVisible"
    />
    <div
      v-if="isLoading"
      :class="[
        isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-200 text-black',
        'card w-full h-screen flex flex-col justify-center items-center'
      ]"
    >
      <img src="../assets/Photos/truck.png" alt="Truck" class="w-64 h-64 animate-bounce" />
    </div>
    <div
      v-if="!isLoading"
      :class="[
        isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-200 text-black',
        'w-full  text-white flex-col mb-10'
      ]"
    >
      <div
        :class="[
          isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-200 text-black',
          'card h-[auto] flex flex-col p-4'
        ]"
      >
        <p class="pb-6 text-3xl font-bold">On Route to : {{}}</p>
        <div class="mb-4">
          <Map :destination="mapDestination"></Map>
          <button
            v-ripple
            @click="openInGoogleMaps"
            class="py-2 px-4 w-full justify-center bg-orange-500 rounded-md text-white hover:bg-green-700 transition duration-300 ease-in-out mt-4"
          >
            Open Route in Google Maps
          </button>
        </div>
        <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
          <span class="font-bold">Track deliveries</span>
        </h2>
        <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-900']">
          <div class="flex flex-row">
            <Timeline
              :value="timelineEvents"
              :layout="layoutClass"
              class="customized-timeline w-full"
            >
              <template #marker="slotProps">
                <span
                  class="flex w-10 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm"
                  :style="{ backgroundColor: slotProps.item.color }"
                >
                  <i :class="slotProps.item.icon"></i>
                </span>
              </template>
              <template #content="slotProps">
                <div class="timeline-card-wrapper">
                  <Card
                    :class="[
                      isDark ? 'dark bg-neutral-950 text-white' : 'light bg-white-100 text-black',
                      'rounded-xl border border-neutral-500 h-full',
                      slotProps.index !== activeShipmentIndex
                        ? 'bg-gray-900 bg-opacity-50 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:transform hover:-translate-y-1 transition duration-300 hover:shadow-xl'
                    ]"
                  >
                    <template #title>
                      <div class="card-title">{{ slotProps.item.status }}</div>
                    </template>
                    <template #content>
                      <div class="card-content">
                        <div class="flex flex-col gap-2">
                          <div>
                            <p class="text-neutral-500">Shipment ID:</p>
                            {{ slotProps.item.shipment_id }}
                          </div>
                          <div>
                            <p class="text-neutral-500">Start Date:</p>
                            <span>{{ slotProps.item.time }}</span>
                          </div>
                          <div>
                            <p class="text-neutral-500">End Date:</p>
                            <span>{{ slotProps.item.end_time }}</span>
                          </div>
                          <div>
                            <p class="text-neutral-500">Delivery ID:</p>
                            {{ slotProps.item.delivery_id }}
                          </div>
                          <div>
                            <p class="text-neutral-500">Destination:</p>
                            {{ slotProps.item.destination }}
                          </div>
                        </div>
                        <button
                          v-if="slotProps.item.status !== 'Delivered'"
                          class="p-button p-component mt-4 py-2 px-4 w-full justify-center"
                          :class="[
                            slotProps.index !== activeShipmentIndex
                              ? 'bg-gray-900 text-gray-500 opacity-0 cursor-not-allowed'
                              : 'bg-orange-600 text-white hover:bg-orange-500'
                          ]"
                          :disabled="slotProps.index !== activeShipmentIndex"
                          @click="openDialog(slotProps.item)"
                        >
                          {{
                            slotProps.index < activeShipmentIndex ? 'Delivered' : 'Confirm Delivery'
                          }}
                        </button>
                      </div>
                    </template>
                  </Card>
                </div>
              </template>
              <template #connector="slotProps">
                <span
                  class="p-timeline-event-connector"
                  :style="{ backgroundColor: slotProps.item.line_colour }"
                ></span>
              </template>
            </Timeline>
          </div>
        </div>
      </div>
    </div>
    <Dialog v-model:visible="dialogVisible" :modal="true" :closable="false">
      <div
        :class="[
          isDark ? 'text-white bg-neutral-800' : ' bg-white text-neutral-800',
          'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
        ]"
        class="flex flex-col"
      >
        <h2 class="text-xl font-bold mb-4 mt-4 text-center">
          Confirm Delivery for Shipment ID: {{ selectedShipmentId }}
        </h2>
        <p v-if="currentShipmentDetails" class="mb-4 text-center">
          Destination: {{ currentShipmentDetails.destination }}
        </p>

        <div id="app" class="text-white">
          <VueSignaturePad
            width="100%"
            height="500px"
            ref="signaturePad"
            :options="option1"
            v-if="isDark"
          />
          <VueSignaturePad
            width="100%"
            height="500px"
            ref="signaturePad"
            :options="option2"
            v-else
          />
          <!-- Checkbox and Link -->
          <div class="flex justify-center items-center mt-4">
            <input type="checkbox" id="acceptPopi" v-model="isPopiAccepted" class="mr-2" />
            <br /><br />
            <label for="acceptPopi" class="text-sm">
              I accept the
              <a href="#" @click="showPopiInfo" class="underline text-blue-500">POPI information </a
              >.
            </label>
          </div>

          <!-- POPI Information Dialog -->
          <Dialog v-model:visible="isPopiDialogVisible" :modal="true" :closable="true">
            <div class="p-4">
              <h2 class="text-xl font-bold mb-4">POPI Information</h2>

              <!-- Why We Store Signatures -->
              <h3 class="text-lg font-semibold mt-2">Why We Store Your Signature</h3>
              <p class="text-sm mb-4">
                Your signature is collected and stored to verify the authenticity of deliveries and
                to ensure that the correct recipient has received the goods. This is part of our
                commitment to maintaining high standards of security and accuracy in our delivery
                processes. By storing your signature, we can prevent fraud, resolve disputes, and
                improve the overall delivery experience.
              </p>

              <!-- How Long We Store It -->
              <h3 class="text-lg font-semibold mt-2">How Long We Will Store Your Signature</h3>
              <p class="text-sm mb-4">
                We retain your signature for a period of 2 years, which is the minimum period
                required by law or our internal policies. After this period, your signature will be
                securely deleted from our systems. This retention period allows us to meet legal
                obligations and ensure that we can provide support in case of any future queries or
                disputes regarding your delivery.
              </p>

              <!-- How We Protect It -->
              <h3 class="text-lg font-semibold mt-2">How We Protect Your Signature</h3>
              <p class="text-sm mb-4">
                Protecting your personal information is our top priority. Your signature is
                encrypted using industry-standard encryption protocols both in transit and at rest.
                Only authorized personnel have access to this information, and we regularly review
                our security practices to ensure that your data remains safe from unauthorized
                access, loss, or misuse.
              </p>

              <!-- Where We Store It -->
              <h3 class="text-lg font-semibold mt-2">Where We Store Your Signature</h3>
              <p class="text-sm mb-4">
                Your signature is stored securely in our supabase servers located in New York. These
                servers comply with all relevant data protection regulations and are managed by
                trusted service providers who adhere to strict security standards. We ensure that
                all data storage practices meet the requirements of the POPI Act and other
                applicable laws.
              </p>

              <!-- Close Button -->
              <button
                @click="isPopiDialogVisible = false"
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </Dialog>

          <div>
            <Button
              :disabled="!isPopiAccepted"
              class="w-full mb-2 rounded-md bg-green-900 justify-center py-2 px-4"
              @click="save(selectedShipmentId)"
              >Save</Button
            >
            <Button class="w-full rounded-md bg-red-800 justify-center py-2 px-4" @click="undo"
              >Undo</Button
            >
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center align-center">
        <Button
          icon="pi pi-arrow-left"
          iconPos="left"
          label="Back"
          class="font-semibold w-auto p-button-text text-orange-500 p-2"
          @click="dialogVisible = false"
        ></Button>
      </div>
    </Dialog>
  </div>

  <div
    v-if="showStartNewDeliveryOverlay"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <div
      class="absolute inset-0 backdrop-blur-sm"
      style="background-color: rgba(0, 0, 1, 0.5)"
    ></div>
    <div
      class="relative z-10 dark: p-8 rounded-lg shadow-lg text-center"
      :class="[isDark ? ' bg-neutral-800 text-white ' : '  bg-white text-black']"
    >
      <h2
        :class="[isDark ? 'bg-neutral-800 text-white ' : '  text-black']"
        class="text-2xl font-bold mb-4"
      >
        Start a New Delivery
      </h2>
      <p :class="[isDark ? '  text-white ' : '  text-black']" class="mb-6">
        Please start a new delivery to begin.
      </p>
      <button
        @click="togglePopUpDialog()"
        :class="[
          isDark ? ' text-white ' : 'text-black',
          'px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition duration-300'
        ]"
      >
        Start New Delivery
      </button>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

.header {
  text-align: center;
  font-size: 1.5rem;
  font-family:
    Arial rgb(255, 255, 255),
    sans-serif;
  margin-bottom: 1rem;
}

.bold-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 32px;
  color: rgb(255, 255, 255);
}

.light-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: 100;
  color: rgb(255, 255, 255);
}

.small-text {
  font-size: 15px;
}

.delivered-button:hover {
  background-color: #ffffff;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.picture-section,
.signature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.p-card .p-card-body {
  padding-top: 0.5rem;
  background-color: #ffffff;
  border-radius: 20px;
  color: black;
}

.dark .p-card .p-card-body {
  padding-top: 0.5rem;
  background-color: #0a0a0a;
  border-radius: 10px;
  color: white;
}
.p-card .p-card-content {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.p-timeline {
  gap: 0.5rem;
}

.p-timeline-left .p-timeline-event-opposite {
  text-align: left;
  padding: 0;
  flex-grow: 0;
}

.p-dialog-mask {
  background-color: rgba(0, 0, 1, 0.5) !important;
  backdrop-filter: blur(4px);
  z-index: 9998 !important; /* Ensure it is above other elements */
}
</style>

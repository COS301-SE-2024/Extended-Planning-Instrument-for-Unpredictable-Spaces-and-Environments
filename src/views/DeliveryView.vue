<!-- DELIVERYVIEW.VUE -->

<script setup>
import { useDark } from '@vueuse/core'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import DeliverySidebar from '@/components/DeliverySidebar.vue'
import Map from '@/components/Map.vue'
import { supabase } from '@/supabase'
import { ref, /*computed,*/ onMounted/*, toRaw*/ } from 'vue'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
// import FileUpload from 'primevue/fileupload'
// import Map from '@/components/Map.vue';
const isDark = useDark()

const showStartNewDeliveryOverlay = ref(true)

const currentShipmentDetails = ref(null)

// const toggleDark = () => {
//   isDark.value = !isDark.value
//   console.log('Dark mode:', isDark.value ? 'on' : 'off')
// }

// const showDialog = ref(false)
const dialogVisible = ref(false)
const dialogPopUpVisible = ref(false)
const mapDestination = ref(null)

const toggleDialog = () => {
  console.log('Toggling dialog')
  dialogVisible.value = !dialogVisible.value
}

const togglePopUpDialog = () => {
  console.log('Toggling dialog')
  dialogPopUpVisible.value = !dialogPopUpVisible.value
}

const shipmentsByDelivery = ref([])
const pendingLocations = ref([])

const currentDestination = ref('')
// const deliveriesByDriverID = ref([])
const deliveries = ref([])
// const visible = ref(true)

const timelineEvents = ref([])

const confirmedShipments = ref(new Set())

const selectedShipmentId = ref(null)

const getShipmentByDeliveryId = async () => {
  try {
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
      if (!shipmentsByDelivery.value[currentDelivery.value.id]) {
        shipmentsByDelivery.value[currentDelivery.value.id] = []
      }
      shipmentsByDelivery.value[currentDelivery.value.id].push(...data.data)

      if (data.data.length > 0 && data.data[0].Destination) {
        mapDestination.value = data.data[0].Destination
        console.log('HERE IS THE NEXT MAP', mapDestination.value)
      }
      identifyPendingLocations()
      updateTimelineEvents()
    }
  } catch (error) {
    console.error(`Error fetching shipments for delivery ${currentDelivery.value.id}:`, error)
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
      // console.log('Error fetching status: ' + status)
      return '#6b7280'
  }
}

//function formattedDateTime(slotProps) {
  //const options = { dateStyle: 'medium', timeStyle: 'short' }
  //return new Date(slotProps.item.time).toLocaleString('en-US', options)
//}

const currentDelivery = ref(null)

const handleDeliveryFromSidebar = (delivery) => {
  // If delivery is a ref, we need to access its value
  currentDelivery.value = delivery._isRef ? delivery.value : delivery

  // console.log('Processed delivery data:', currentDelivery.id)
  getShipmentByDeliveryId()
  // Trigger timeline update
  updateTimeline()
}

const upDateShipmentStatus = async (shipmentId) => {
  try {
    const { /*data,*/ error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateShipmentStatus',
        shipmentId: shipmentId,
        newStatus: 'Delivered'
      }),
      method: 'POST'
    })
    if (error) {
      console.log(`API Error for delivery ${currentDelivery.value.id}:`, error)
    } else {
      console.log('Successfully updated Status')
    }
  } catch (error) {
    console.error(`Error fetching shipments for delivery ${currentDelivery.value.id}:`, error)
  }
}

function save(shipmentid) {
  // const { isEmpty, data } = this.$refs.signaturePad.saveSignature()
  // console.log(isEmpty)
  // console.log(data)

  console.log('SHIPEMENT ID HAS ARRIVED', shipmentid)

  if (pendingLocations.value.length > 0) {
    pendingLocations.value.shift() // Remove the first (current) destination
    if (pendingLocations.value.length > 0) {
      console.log('PENDING LOCATIONS', pendingLocations.value)
      currentDestination.value = pendingLocations.value[0]
      mapDestination.value = pendingLocations.value[0]
      upDateShipmentStatus(shipmentid)
    } else {
      currentDestination.value = ''
      upDateShipmentStatus(shipmentid)
      mapDestination.value = 'University of Pretoria'
      alert('All destinations visited')
    }
  }

  confirmedShipments.value.add(shipmentid)
  toggleDialog()
}
async function setupSubscription() {
  await supabase // Await for the subscription to be established
    .channel('*')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Shipment' }, (payload) => {
      // console.log(payload.new)
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
      color: newColor,
      line_colour: newColor
    }

    // Update the next event's line_colour if it exists
    if (index < timelineEvents.value.length - 1) {
      timelineEvents.value[index + 1] = {
        ...timelineEvents.value[index + 1],
        line_colour: newColor
      }
    }

    // Force Vue to react to the change
    timelineEvents.value = [...timelineEvents.value]

    currentShipmentDetails.value = {
      id: updatedShipment.id,
      destination: updatedShipment.Destination,
      status: newStatus
    }
  }
}

const startNewDelivery = () => {
  showStartNewDeliveryOverlay.value = false
  // Reset other necessary state variables
  currentDelivery.value = null
  shipmentsByDelivery.value = []
  pendingLocations.value = []
  currentDestination.value = ''
  timelineEvents.value = []
  confirmedShipments.value = new Set()
  mapDestination.value = null
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
        line_colour: index === shipments.length - 1 ? '#6b7280' : color
      })
    })
  }
  timelineEvents.value = events
}
onMounted(() => {
  // console.log('DeliveryView: Component mounted')
  setupSubscription()
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
      isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-100 text-black',
      ' h-[auto] flex flex-col '
    ]"
  >
    <DeliverySidebar 
      @handle-delivery="handleDeliveryFromSidebar" 
      @start-new-delivery="startNewDelivery"
    />
    <div
      :class="[
        isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-100 text-black',
        'w-full  text-white flex-col mb-10'
      ]"
    >
      <div
        :class="[
          isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-100 text-black',
          'card h-[auto] flex flex-col p-4'
        ]"
      >
        <p class="pb-6 text-3xl font-bold">On Route to : {{}}</p>
        <div class="mb-4">
          <Map :destination="mapDestination"></Map>
        </div>
        <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
          <span class="font-bold">Track deliveries</span>
        </h2>
        <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-900']">
          <div class="flex flex-row">
            <Timeline
              :value="timelineEvents"
              layout="horizontal"
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
                      'rounded-xl border border-neutral-500 h-full'
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
                        <Button
                          @click="
                            () => {
                              dialogVisible = true;
                              selectedShipmentId = slotProps.item.shipment_id;
                              currentShipmentDetails = {
                                id: slotProps.item.shipment_id,
                                destination: slotProps.item.destination,
                                status: slotProps.item.status
                              };
                            }
                          "
                          :disabled="confirmedShipments.has(slotProps.item.shipment_id)"
                          class="mt-4 py-2 px-4 w-full justify-center"
                          :class="[
                            confirmedShipments.has(slotProps.item.shipment_id) ? 
                            'bg-orange-600 text-white opacity-70 cursor-not-allowed' : 
                            isDark ? 'bg-orange-600 text-white' : 'bg-black text-white hover:bg-orange-600',
                          ]"
                        >
                          {{
                            confirmedShipments.has(slotProps.item.shipment_id)
                              ? 'Delivered'
                              : 'Confirm Delivery'
                          }}
                        </Button>
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
        <h2 class="text-xl font-bold mb-4 text-center">
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

          <div>
            <Button
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

  <div v-if="showStartNewDeliveryOverlay" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
    <div class="relative z-10 bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg text-center">
      <h2 class="text-2xl font-bold mb-4">Start a New Delivery</h2>
      <p class="mb-6">Please start a new delivery to begin.</p>
      <button 
        @click="togglePopUpDialog()"
        class="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition duration-300"
      >
        Start New Delivery
      </button>
    </div>
    <Dialog
      header="Edit User Profile"
      v-model:visible="dialogPopUpVisible"
      :modal="true"
      :closable="false"
      class="z-10000000000 w-[auto] p-4 relative"
    >
      <div
        :class="[isDark ? ' text-white border-white' : ' text-black border-black', 'border-b-2']"
        class="mb-4"
      >
        <p class="text-3xl mb-2">Current Deliveries:</p>
      </div>
      <div v-if="isLoading">Loading deliveries...</div>
      <div v-else-if="errorMessage">{{ errorMessage }}</div>
      <div v-else class="pb-12">
        <!-- Adjust padding to avoid overlap -->
        <div v-for="delivery in deliveriesByStatus" :key="delivery.id" class="mb-8">
          <p class="text-neutral-400 text-lg">Delivery Status:</p>
          <p class="text-lg">{{ delivery.Status }}</p>
          <p class="text-neutral-500 text-lg">Delivery ID:</p>
          <p class="mb-2 text-lg">{{ delivery.id }}</p>

          <Button
            @click="handleDelivery(delivery)"
            :class="[isDark ? 'text-white' : ' text-white', 'focus:outline-none focus:ring-0']"
            class="text-lg justify-center px-4 py-2 w-full bg-green-800"
            >Start Delivery</Button
          >
        </div>
        <div v-if="deliveriesByStatus.length === 0">No deliveries found.</div>
      </div>
      <div
        :class="[
          isDark ? 'bg-neutral-800 text-white' : 'bg-white text-white',
          'focus:outline-none focus:ring-0'
        ]"
        class="bg-neutral-800 p-6 absolute bottom-4 left-4 right-4"
      >
        <Button @click="togglePopUpDialog()" class="text-lg justify-center px-4 py-2 w-full bg-red-800"
          >Close</Button
        >
      </div>
    </Dialog>
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
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.5) !important; /* Dimmed background */
  z-index: 9998 !important; /* Ensure it is above other elements */
}
.p-timeline-left .p-timeline-event-opposite {
  text-align: left;
  padding: 0;
  flex-grow: 0;
}
</style>

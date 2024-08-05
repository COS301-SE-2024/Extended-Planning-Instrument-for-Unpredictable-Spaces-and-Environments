<!-- DELIVERYVIEW.VUE -->

<script setup>
import { useDark } from '@vueuse/core'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import DeliverySidebar from '@/components/DeliverySidebar.vue'
import Map from '@/components/Map.vue'

import { ref, computed, onMounted, toRaw } from 'vue'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
// import Map from '@/components/Map.vue';
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}

const showDialog = ref(false)
const dialogVisible = ref(false)

const toggleDialog = () => {
  console.log('Toggling dialog')
  dialogVisible.value = !dialogVisible.value
}

const submitImage = () => {
  console.log('Image submitted')
  showDialog.value = false
}

const deliveriesByDriverID = ref([])
const deliveries = ref([])
const visible = ref(true)
const getAllDeliveries = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getAllDeliveries' }),
      method: 'POST'
    })
    if (error) {
      console.log('API Error:', error)
    } else {
      deliveries.value = data.data
      await getDeliveriesByDriverID()
      visible.value = false
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const getDeliveriesByDriverID = async () => {
  deliveriesByDriverID.value = {}

  for (const delivery of deliveries.value) {
    try {
      const { data, error } = await supabase.functions.invoke('core', {
        body: JSON.stringify({
          type: 'getDeliveriesByDriverID',
          deliveryID: delivery.id
        }),
        method: 'POST'
      })

      if (error) {
        console.log(`API Error for delivery ${delivery.id}:`, error)
      } else {
        if (!shipmentsByDelivery.value[delivery.id]) {
          shipmentsByDelivery.value[delivery.id] = []
        }
        shipmentsByDelivery.value[delivery.id].push(...data.data)
        // console.log(shipmentsByDelivery.value[delivery.id])
      }
    } catch (error) {
      console.error(`Error fetching shipments for delivery ${delivery.id}:`, error)
    }
  }
}

const getStatusColor = (status) => {
  const cleanStatus = status.replace(/\s+/g, '').toLowerCase()
  switch (cleanStatus) {
    case 'shipped':
      return '#d97706'
    case 'processing':
      return '#6b7280'
    case 'delivered':
      return '#14532d'
    default:
      console.log('Error fetching status: ' + status)
      return '#6b7280'
  }
}

function formattedDateTime(slotProps) {
  const options = { dateStyle: 'medium', timeStyle: 'short' }
  return new Date(slotProps.item.time).toLocaleString('en-US', options)
}
const currentDelivery = ref(null)

const handleDeliveryFromSidebar = (delivery) => {
  console.log('DeliveryView: Handling delivery from sidebar:', delivery)

  // If delivery is a ref, we need to access its value
  currentDelivery.value = delivery._isRef ? delivery.value : delivery

  console.log('Processed delivery data:', currentDelivery.value)
  // Trigger timeline update
  updateTimeline()
}

const updateTimeline = () => {
  if (currentDelivery.value) {
    // Assuming the delivery object has a 'status' property
    // You may need to adjust this based on the actual structure of your data
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

const timelineEvents = computed(() => {
  return deliveries.value.map((delivery) => ({
    status: delivery.status,
    date: delivery.date,
    icon: delivery.icon,
    color: delivery.color,
    image: delivery.image
  }))
})
onMounted(() => {
  console.log('DeliveryView: Component mounted')
  getAllDeliveries()
})

// const emitHandleDelivery = (delivery) => {
//   emit('handle-delivery', delivery)
// }
</script>
<script>
export default {
  name: 'MySignaturePad',
  data() {
    return {
      option1: {
        penColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(23,23,23)'
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
    },
    save() {
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature()
      console.log(isEmpty)
      console.log(data)
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
    <DeliverySidebar @handle-delivery="handleDeliveryFromSidebar" />
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
          <Map />
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
                            <p class="text-neutral-500">Driver ID:</p>
                            {{ currentDelivery?.value?.Driver_id }}
                          </div>
                          <div>
                            <p class="text-neutral-500">Date:</p>
                            <!-- <span>{{ new Date(slotProps.item.date).toLocaleString() }}</span> -->
                          </div>
                          <div>
                            <p class="text-neutral-500">Delivery ID:</p>
                            {{ currentDelivery?.value?.id }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </template>
              <template #connector="slotProps">
                <span
                  class="p-timeline-event-connector"
                  :style="{ backgroundColor: slotProps.item.line_color }"
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
          isDark ? 'text-white bg-neutral-900' : ' bg-white text-neutral-800',
          'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
        ]"
        class="flex flex-col"
      >
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
              @click="save"
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
        />
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

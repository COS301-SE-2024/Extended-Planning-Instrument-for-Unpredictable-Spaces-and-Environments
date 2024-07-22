<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900 text-white' : 'light bg-gray-100 text-black',
      ' h-[auto] flex flex-col '
    ]"
  >
    <DeliverySidebar />
    <div
      :class="[
        isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-100 text-black',
        'w-full  text-white flex-col mb-10'
      ]"
    >
      <div
        :class="[
          isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-100 text-black',
          'flex w-[auto] content-center p-4'
        ]"
      >
        <img src="@/assets/image.png" alt="Image" style="object-fit: cover; border-radius: 5px" />
      </div>
      <div
        :class="[
          isDark ? 'dark bg-neutral-900 text-white ' : 'light bg-gray-100 text-black',
          'card h-[auto] flex flex-col p-4'
        ]"
      >
        <p class="pb-8 text-3xl font-bold">Shipment #345290</p>
        <div class="flex flex-row">
          <Timeline :value="events" class="customized-timeline">
            <template #marker="slotProps">
              <span
                class="flex w-10 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm"
                :style="{ backgroundColor: slotProps.item.color }"
              >
                <i :class="slotProps.item.icon"></i>
              </span>
            </template>
            <template #content="slotProps">
              <Card
                :class="[
                  isDark ? 'dark bg-neutral-950 text-white ' : 'light bg-white-100 text-black',
                  'rounded-md'
                ]"
                style="width: 95%"
              >
                <template #title>
                  {{ slotProps.item.status }}
                </template>
                <template #content>
                  {{ slotProps.item.date }} {{ slotProps.item.time }}
                  {{ slotProps.item.location }}
                  {{ slotProps.item.coordinates }}
                  <div
                    v-if="slotProps.item.status === 'Delivered'"
                    class="flex flex-row w-full justify-center items-end content-end mt-10"
                  >
                    <button
                      :class="[
                        slotProps.item.past ? '  bg-amber-600' : ' bg-violet-900',
                        'text-white'
                      ]"
                      :disabled="!slotProps.item.past"
                      class="p-2 rounded-md w-full"
                      @click="showDialog = true"
                    >
                      Confirm Delivery
                    </button>
                  </div>
                </template>
              </Card>
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
    <Dialog
      header="Confirmation"
      v-model:visible="showDialog"
      :modal="true"
      :closable="false"
      :draggable="false"
    >
      <div class="dialog-content">
        <div class="picture-section">
          <h3>Picture</h3>
          <FileUpload name="demo[]" url="./upload" accept="image/*" :auto="true" />
        </div>
        <div class="signature-section">
          <h3>Signature</h3>
          <!-- Signature component or area can be added here -->
        </div>
      </div>
      <div class="p-dialog-footer">
        <button @click="showDialog = false" class="p-button p-component p-button-text">
          Cancel
        </button>
        <button @click="submitImage" class="p-button p-component p-button-primary">Submit</button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { useDark } from '@vueuse/core'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import DeliverySidebar from '@/components/DeliverySidebar.vue'
import { ref } from 'vue'
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
const events = ref([
  {
    status: 'On Route',
    location: '1268 Burnett Street Hatfield Pretoria 0012',
    icon: 'pi pi-map-marker',
    color: '#d97706',
    line_colour: '#d97706',
    past: true
  },
  {
    status: 'Delivered',
    location: 'Cape Town',
    coordinates: '-33.9249, 18.4241',
    date: '15/10/2020',
    time: '10:30',
    icon: 'pi pi-box',
    color: '#d97706', //orange
    line_colour: '#d97706',
    past: true
  },
  {
    status: 'On Route',
    location: '413 The Meridian Solheim Johannesburg 0014',
    icon: 'pi pi-map-marker',
    color: '#2e1065',
    line_colour: '#2e1065', //purple
    past: false
  },
  {
    status: 'Delivered',
    location: 'Johannesburg',
    coordinates: '-26.2041, 28.0473',
    date: '15/10/2020',
    time: '10:30',
    icon: 'pi pi-box',
    color: '#2e1065',
    line_colour: '#2e1065', //purple
    past: false
  },
  { status: 'Complete', icon: 'pi pi-flag', color: '#14532d', past: false, line_colour: '#6b7280' }
])

const showDialog = ref(false)

const submitImage = () => {
  console.log('Image submitted')
  showDialog.value = false
}
</script>

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

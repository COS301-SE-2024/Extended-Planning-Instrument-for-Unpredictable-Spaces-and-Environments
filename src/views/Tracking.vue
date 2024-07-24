<script setup>
import { useDark } from '@vueuse/core'
import InputText from 'primevue/inputtext'
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import DialogComponent from '@/components/DialogComponent.vue'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
// SUPA BASE
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rgisazefakhdieigrylb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzMTMxNTEsImV4cCI6MjAzMTg4OTE1MX0.xNhTpM5Qxz8sHW0JPFSoFaWAtI425QPoI17jofYxoFA'
// SUPA BASE
const supabase = createClient(supabaseUrl, supabaseKey)
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
}
const dialogVisible = ref(false)
const getRawData = (refData) => JSON.parse(JSON.stringify(refData))
const shipmentsByDelivery = ref([])
const deliveries = ref([])
const events = ref([
  {
    status: 'Loading...', // Default status
    time: 0, // Default time
    delivery_id: 0, // Default delivery_id
    driver_id: 0, // Default driver_id
    icon: 'pi pi-map-marker',
    color: '#d97706',
    line_colour: '#d97706',
    past: true
  },
  {
    status: 'Complete',
    icon: 'pi pi-flag',
    color: '#14532d',
    past: false,
    line_colour: '#6b7280'
  }
])

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
      // Call getShipmentsByDeliveryID here, after deliveries are populated
      await getShipmentsByDeliveryID()
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const getShipmentsByDeliveryID = async () => {
  shipmentsByDelivery.value = {} // Reset the shipments object

  for (const delivery of deliveries.value) {
    try {
      const { data, error } = await supabase.functions.invoke('core', {
        body: JSON.stringify({
          type: 'getShipmentByDeliveryID',
          deliveryID: delivery.id // Use the actual delivery ID here
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
      }
    } catch (error) {
      console.error(`Error fetching shipments for delivery ${delivery.id}:`, error)
    }
  }
}

// const groupedDeliveries = computed(() => {
//   return Object.entries(shipmentsByDelivery.value).map(([deliveryId, shipments]) => ({
//     deliveryId,
//     shipments
//   }))
// })
const groupedDeliveries = computed(() => {
  console.log('Computing grouped deliveries')

  return Object.entries(shipmentsByDelivery.value).flatMap(([deliveryId, shipments]) => {
    console.log('Processing deliveryId:', deliveryId)

    const delivery = deliveries.value.find((d) => d.id.toString() === deliveryId)
    console.log('Delivery:', delivery)

    return shipments.map((shipment, index) => {
      console.log('Shipment:', shipment)

      return {
        status: shipment.Status || 'Unknown',
        time: shipment.Created_at || delivery?.Start_time || 0,
        delivery_id: deliveryId,
        driver_id: delivery?.Driver_id || 0,
        shipment_id: shipment.id,
        icon: 'pi pi-box',
        color: index === shipments.length - 1 ? '#14532d' : '#d97706',
        line_colour: index === shipments.length - 1 ? '#6b7280' : '#d97706',
        past: index < shipments.length - 1
      }
    })
  })
})

async function setupSubscription() {
  await supabase
    .channel('*')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Users' }, (payload) => {
      // console.log(payload.new)
      updateUserInTable(payload.new)
    })
    .subscribe()
}

onMounted(() => {
  setupSubscription()
  getAllDeliveries()
})

const loading = ref(false)
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900 text-white' : 'bg-gray-100 text-black',
      'w-full h-full flex flex-row shadow-lg'
    ]"
  >
    <Sidebar />
    <!-- Main Content -->
    <div class="flex flex-col p-4 ml-2 w-full">
      <!-- Search Input -->
      <div class="w-full md:w-[300px] mb-4">
        <div
          :class="[
            isDark
              ? 'border-neutral-500 bg-neutral-900 text-white'
              : 'border-gray-500 bg-white text-black',
            'border flex items-center px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-orange-500'
          ]"
        >
          <i :class="[isDark ? 'text-white' : 'text-black', 'pi pi-search mr-2']"></i>
          <InputText
            placeholder="Search"
            :class="[
              isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black',
              'focus:outline-none focus:ring-0'
            ]"
          />
        </div>
      </div>
      <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
        <span class="font-bold">Track deliveries</span>
      </h2>
      <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-900']">
        <Accordion :activeIndex="0" class="custom-accordion w-full">
          <AccordionTab
            v-for="group in groupedDeliveries"
            :key="group.delivery_id"
            :header="`Delivery ID: ${group.delivery_id}`"
            :class="isDark ? 'dark-mode-accordion-tab' : 'light-mode-accordion-tab'"
          >
            <div class="flex flex-row">
              <Timeline :value="[group]" class="customized-timeline">
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
                      isDark ? 'dark bg-neutral-950 text-white' : 'light bg-white-100 text-black',
                      'rounded-md'
                    ]"
                    style="width: 95%"
                  >
                    <template #title>
                      {{ slotProps.item.status }}
                    </template>
                    <template #content>
                      {{ slotProps.item.date }} {{ slotProps.item.time }}
                      <br />
                      <p class="text-neutral-500">Delivery ID : {{ slotProps.item.delivery_id }}</p>
                      <p class="text-neutral-500">Driver ID : {{ slotProps.item.driver_id }}</p>
                      <div
                        v-if="slotProps.item.status === 'Delivered'"
                        class="flex flex-row w-full justify-center items-end content-end mt-10"
                      >
                        <button
                          :class="[
                            slotProps.item.past ? 'bg-amber-600' : 'bg-violet-900',
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
          </AccordionTab>
        </Accordion>
      </div>
      <!-- Users Table -->
      <div>
        <p class="pb-8 text-3xl font-bold">Delivery 1</p>
      </div>
      <div class="mt-4 flex items-center justify-center">
        <p
          @click="toggleDialog"
          class="text-orange-500 font-bold text-center hover:-translate-y-1 underline cursor-pointer transition duration-300"
        >
          Help
        </p>
      </div>
    </div>
  </div>

  <Dialog
    :class="[isDark ? 'dark' : '', ' w-[400px]']"
    header="Edit User Profile"
    v-model:visible="dialogVisible"
    :modal="true"
    :closable="false"
  >
    <div
      :class="[
        isDark ? 'text-white bg-neutral-900' : ' bg-white text-neutral-800',
        'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
      ]"
      class="flex flex-col"
    >
      <div class="field flex flex-col">
        <label class="text-xl font-semibold" for="FullName">Full Name</label>
        <InputText
          :class="[
            isDark
              ? 'text-white border bg-neutral-950 border-transparent'
              : 'border border-neutral-900 bg-white text-neutral-800',
            'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
          ]"
          v-model="selectedUser.FullName"
          id="FullName"
        />
      </div>
      <div class="field flex flex-col">
        <label class="text-xl font-semibold" for="Email">Email</label>
        <InputText
          :class="[
            isDark
              ? 'text-white border bg-neutral-950 border-transparent'
              : 'border border-neutral-900 bg-white text-neutral-800',
            'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
          ]"
          v-model="selectedUser.Email"
          id="Email"
        />
      </div>
      <div class="field flex flex-col">
        <label class="text-xl font-semibold" for="Role">Role</label>

        <Dropdown
          :class="[
            isDark
              ? 'text-white border bg-neutral-950 border-transparent'
              : 'border border-neutral-900 bg-white text-neutral-800',
            'mt-2 mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500',
            { 'z-99999999999999999': true } // Adjust z-index here
          ]"
          v-model="selectedRole"
          :options="roles"
          optionLabel="name"
          placeholder="Select a Role"
          class="w-full md:w-14rem"
        />
      </div>
      <div class="field flex flex-col">
        <label class="text-xl font-semibold" for="Phone">Phone Number</label>
        <InputText
          :class="[
            isDark
              ? 'text-white border bg-neutral-950 border-transparent'
              : 'border border-neutral-900 bg-white text-neutral-800',
            'mt-2  mb-6 form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
          ]"
          v-model="selectedUser.Phone"
          id="Phone"
        />
      </div>
    </div>
    <div class="flex flex-col items-center align-center">
      <Button
        label="Save"
        class="w-full font-semibold p-button-text text-white bg-green-800 rounded-xl p-2 mb-3"
        :loading="loading"
        @click="saveChanges"
      />

      <Button
        icon="pi pi-arrow-left"
        iconPos="left"
        label="Back"
        class="font-semibold w-auto p-button-text text-orange-500 p-2"
        @click="dialogVisible = false"
      />
    </div>
  </Dialog>
  <div>
    <DialogComponent
      v-if="showDialog"
      :images="[{ src: '/Members/Photos/manage-users.png', alt: 'Alternative Image 1' }]"
      title="Contact Support"
      :contacts="[
        { name: 'Call', phone: '+27 12 345 6789', underline: true },
        { name: 'Email', phone: 'janeeb.solutions@gmail.com', underline: true }
      ]"
      :dialogVisible="showDialog"
      @close-dialog="toggleDialog"
    />
  </div>
</template>
<script>
export default {
  components: {
    DialogComponent
  }
}
const showDialog = ref(false)
const toggleDialog = () => {
  showDialog.value = !showDialog.value
}
</script>
<style>
/* Light mode styles */
.body {
  background-color: white;
  color: black;
}
.p-datatable-thead > tr > th,
.datatable-light .p-datatable-tfoot > tr > th {
  background-color: rgba(255, 255, 255, 0.226);
  color: black;
}

.p-paginator {
  background-color: white;
  color: black;
}

.p-paginator .p-dropdown {
  background-color: white !important;
  color: black;
  border: 1px solid #262626;
}

.p-paginator .p-dropdown .p-dropdown-trigger {
  color: rgb(255, 145, 0) !important;
}

.p-paginator .p-inputtext {
  background-color: white !important;
  color: black !important;
}

.p-datatable-tbody > tr {
  background-color: white;
  color: black;
}

.p-datatable-tbody > tr:nth-child(even) {
  background-color: #f2f2f2;
}

.p-datatable-tbody > tr:hover {
  background-color: #e0e0e0;
  color: black;
}

/* PANEL STYLING */
.p-dropdown-panel {
  background: white;
}
.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
  color: #000000;
  background-color: #ffffff;
}
.p-dropdown-panel .p-dropdown-items .p-dropdown-item:not(.p-highlight):not(.p-disabled).p-focus {
  color: rgba(0, 0, 0, 0.87);
  background: rgb(255, 255, 255);
}

.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  margin: 0;
  padding: 1rem 1rem;
  border: 0 none;
  color: rgba(0, 0, 0, 0.87);
  background: white;
  transition: none;
  border-radius: 0;
}

/* Dark mode styles */
.dark {
  background-color: #171717;
  color: white;
}

.dark .p-datatable-header {
  background-color: #262626;
  color: white;
}

.dark .p-datatable-thead > tr > th,
.dark .p-datatable-tfoot > tr > th {
  background-color: #262626;
  color: white;
}

.dark .p-datatable-tbody > tr {
  background-color: #171717;
  color: white;
}

.dark .p-datatable-tbody > tr:nth-child(even) {
  background-color: #262626;
}

.dark .p-datatable-tbody > tr:hover {
  background-color: #444444;
}

.dark .p-datatable-footer {
  background-color: #262626;
  color: white;
}

.dark .p-paginator {
  background-color: #262626;
  color: white;
}
.dark .p-paginator .p-dropdown {
  background-color: #262626 !important;
  color: #333333 !important;
  border: 1px solid #262626 !important;
}
.dark .p-paginator .p-dropdown .p-dropdown-trigger {
  color: rgb(255, 145, 0);
  background-color: #262626;
}

.dark .p-paginator .p-inputtext {
  background: #262626 !important;
  color: white !important;
}

.dark .p-dropdown-panel {
  background: #262626;
}
.dark .p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
  color: rgb(255, 145, 0);
  background-color: #262626;
}
.dark
  .p-dropdown-panel
  .p-dropdown-items
  .p-dropdown-item:not(.p-highlight):not(.p-disabled).p-focus {
  color: rgb(255, 145, 0);
  background-color: #262626;
}

.dark .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  margin: 0;
  padding: 1rem 1rem;
  border: 0 none;
  color: rgba(255, 255, 255, 0.87);
  background: #333333;
  transition: none;
  border-radius: 0;
}

p-dialog-mask p-component-overlay p-component-overlay-enter {
  z-index: 90999999;
}
.p-dialog {
  background-color: rgb(255, 255, 255);
  color: black;
}

.p-dialog .p-dialog-content {
  background-color: white;
  color: black;
}
.p-p-dialog-titlebar {
  background-color: #f3f4f6;
  color: black;
}
.p-dialog .p-dialog-header {
  border-bottom: 2px solid #333333;
  background-color: #f3f4f6;
  color: black;
  text-align: center; /* Center the header text */
  font-weight: bold; /* Use font-weight instead of just "font" */
}

.p-confirm-dialog-message {
  text-align: center; /* Center the message text */
}

.dark .p-dialog {
  background-color: #262626;
  color: white;
}

.dark .p-dialog .p-dialog-content {
  background-color: #171717;
  color: white;
}
.dark .p-dialog-titlebar {
  background-color: #171717;
  color: white;
}
.dark .p-dialog .p-dialog-header {
  background-color: #171717;
  color: white;
}
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.5) !important; /* Dimmed background */
  z-index: 800 !important ; /* Ensure it is above other elements */
}

.p-dropdown-panel.p-component.p-ripple-disabled {
  z-index: 99999999 !important;
  color: black;
}
.p-inputtext {
  color: black;
}
.dark .p-inputtext {
  color: white;
}
.dark .p-dropdown-panel.p-component.p-ripple-disabled {
  z-index: 99999999 !important;
}
</style>

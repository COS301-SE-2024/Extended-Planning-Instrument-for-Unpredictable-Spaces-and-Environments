<script setup>
import { useDark } from '@vueuse/core'
import InputText from 'primevue/inputtext'
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { supabase } from '../supabase'
import { format, parseISO } from 'date-fns'

const isDark = useDark()
const chartData = ref({
  labels: [],
  datasets: []
})
const chartDataDeliveries = ref({
  labels: [],
  datasets: []
})
const knobValue = ref(0)
const packages = ref([])
const deliveries = ref([])
const maxDeliveries = ref([])
const knobValueDelivered = ref([])

// const router = useRouter()

let userName
async function getUsername() {
  const { data } = await supabase.auth.getSession()
  userName = data.session.user.identities[0].identity_data.name
}

// async function checkAuth() {
//   try {
//     // Get the user session
//     const { data: { session } } = await supabase.auth.getSession();
//     if (session) {
//       router.push("/loading")
//     } else {
//       // No session found, redirect to the home page
//       router.push("/");
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     // Handle any unexpected errors
//     router.push("/");
//   }
// }
// onMounted(() => {
//   // checkAuth();
// })
// const chartData = ref({
//   labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
//   datasets: [
//     {
//       label: 'Algorithm 1',
//       data: [1, 2, 1, 3, 3, 2, 1],
//       borderColor: '#f5a142',
//       backgroundColor: '#000000'
//     },
//     {
//       label: 'Algorithm 2',
//       data: [2, 3, 1, 2, 2, 1, 1],
//       borderColor: '#4300a1',
//       backgroundColor: '#000000'
//     }
//   ],
//   options: {
//     scales: {
//       x: {
//         grid: {
//           color: 'red' // Change the color of the x-axis grid lines
//         }
//       },
//       y: {
//         grid: {
//           color: 'blue' // Change the color of the y-axis grid lines
//         }
//       }
//     }
//   }
// })
const getAllShipments = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getAllShipments' }),
      method: 'POST'
    })

    if (error) {
      console.log('API Error:', error)
    } else {
      const statusCounts = {
        Processing: 0,
        Shipped: 0,
        Delivered: 0
      }

      data.data.forEach((shipment) => {
        const status = shipment.Status.trim()
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++
        }
      })

      chartData.value = {
        labels: ['Processing', 'Shipped', 'Delivered'],
        datasets: [
          {
            label: 'Shipments Status',
            data: [statusCounts.Processing, statusCounts.Shipped, statusCounts.Delivered],
            backgroundColor: ['#ffffff', '#f97316', '#5b21b6']
          }
        ]
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const getAllPackages = async () => {
  try {
    console.log('TRYING')
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getAllPackages' }),
      method: 'POST'
    })

    if (error) {
      console.log('API Error:', error)
    } else {
      const count = data.data.length
      console.log('Number of packages:', count)
      packages.value = data.data
      knobValue.value = count // Update the knob value
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
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
      console.log(deliveries.value)
      console.log()
      maxDeliveries.value = deliveries.value.length
      console.log('MAX : ', maxDeliveries.value)
      knobValueDelivered.value = deliveries.value.filter(
        (delivery) => delivery.Status === 'Delivered'
      ).length
      console.log('Delivered : ', knobValueDelivered.value)
      updateChartData()
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const updateChartData = () => {
  console.log('Starting')
  const monthCounts = {}

  deliveries.value.forEach((delivery) => {
    const month = format(parseISO(delivery.Start_time), 'MMMM yyyy')
    monthCounts[month] = (monthCounts[month] || 0) + 1
    console.log(monthCounts[month])
  })

  chartDataDeliveries.value = {
    labels: Object.keys(monthCounts),
    datasets: [
      {
        label: 'Deliveries per Month',
        data: Object.values(monthCounts),
        backgroundColor: '#f97316'
      }
    ]
  }
  console.log(chartDataDeliveries.value)
  console.log(chartDataDeliveries.label)
}
const events = [
  { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
  { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9900' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
]

const chartOptions = {
  responsive: true
}
onMounted(() => {
  getUsername()
  getAllShipments()
  getAllPackages()
  getAllDeliveries()
})
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

      <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
        <span class="font-bold">Welcome back</span>
      </h2>
      <div class="flex flex-wrap mb-4">
        <div class="w-full mb-4 flex flex-wrap gap-4 md:flex-nowrap">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[50%] h-auto'
            ]"
          >
            <h2 class="mb-6 font-bold">Shipment Overview</h2>
            <div class="flex-grow">
              <Chart type="bar" :data="chartData" class="h-full w-full" />
            </div>
          </div>
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[50%] h-auto'
            ]"
          >
            <h2 class="mb-6 font-bold">Monthly Deliveries</h2>
            <div class="flex-grow">
              <Chart type="bar" :data="chartDataDeliveries" class="h-full w-full" />
            </div>
          </div>
        </div>

        <div class="w-full mb-4 gap-4 flex flex-row">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex-grow p-4 rounded-xl flex flex-col '
            ]"
          >
            <h2 class="mb-1 text-xl font-bold">Packages</h2>
            <div class="flex flex-row flex-grow items-center">
              <Knob
                v-model="knobValue"
                valueColor="#f97316"
                :rangeColor="isDark ? 'White' : 'Black'"
                :class="[isDark ? 'dark' : 'light']"
                :max="500"
              />

              <div class="ml-4 flex flex-col">
                <h2 class="mb-1 font-bold">Total Packages</h2>
                <p class="font-light">{{ knobValue }}/{{ 500 }}</p>
                <h2 class="mb-1 font-bold">Rem. Space</h2>
                <p class="mb-1 font-light">{{ 500 - knobValue }}</p>
              </div>
            </div>
          </div>

          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex-grow p-4 rounded-xl flex flex-col '
            ]"
          >
            <h2 class="mb-1 text-xl font-bold">Deliveries</h2>
            <div class="flex flex-row flex-grow items-center">
              <Knob
                v-model="knobValueDelivered"
                valueColor="#f97316"
                :rangeColor="isDark ? 'White' : 'Black'"
                :class="[isDark ? 'dark' : 'light']"
                :max="maxDeliveries"
              />
              <div class="ml-4 flex flex-col">
                <h2 class="mb-1 font-bold">Delivered</h2>
                <p class="font-light">{{ knobValueDelivered }}/{{ maxDeliveries }}</p>
                <h2 class="mb-1 font-bold">In Progress</h2>
                <p class="mb-1 font-light">{{ maxDeliveries - knobValueDelivered }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full flex flex-wrap mb-4">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[50%] h-auto'
            ]"
          >
            <h2 class="mb-6 font-bold">Monthly Deliveries</h2>
            <div class="flex-grow">
              <Chart type="scatter" :data="chartData" class="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* General styles */
/* General styles for light mode */
.light-calendar {
  background-color: white;
  color: black;
}

.light-calendar .p-datepicker {
  background-color: white;
  border: 1px solid #ccc;
  color: black;
}

.light-calendar .p-datepicker-header {
  background-color: #f7f7f7;
  color: black;
}

.dark-calendar .p-datepicker {
  background-color: #0a0a0a;
  border: 1px solid #444;
}

.dark-calendar .p-datepicker-header {
  background-color: #171717;
  color: white;
}
.dark .p-knob-text {
  stroke: white;
  color: white;
  fill: white;
  background-color: red;
}
.dark .p-knob {
  stroke: white;
  color: white;
  fill: white;
  background-color: #0a0a0a;
}
.light .p-knob-text {
  stroke: #171717;
  color: #171717;
  fill: #171717;
}

/* Additional custom styles */
.dark-calendar .p-datepicker .p-datepicker-prev,
.dark-calendar .p-datepicker .p-datepicker-next {
  color: white;
}

.light-calendar .p-datepicker .p-datepicker-prev,
.light-calendar .p-datepicker .p-datepicker-next {
  color: black;
}

.light .custom-accordion .p-accordion-header .p-accordion-header-link {
  background-color: #f3f4f6;
  color: black;
  border: none;
}

.custom-accordion .p-accordion-header:hover {
  background-color: #f0f0f0;
  color: black;
}

.dark .custom-accordion .p-accordion-header:hover {
  background-color: #3e3e3e;
  color: white;
}

.dark .custom-accordion .p-accordion-content {
  background-color: #0a0a0a;
  color: white;
}
.light .custom-accordion .p-accordion-content {
  background-color: white;
  color: black;
}

.dark .custom-timeline {
  background-color: #0a0a0a;
  color: white;
}
.light .custom-timeline {
  background-color: white;
  color: black;
}

.custom-timeline .p-timeline-event {
  border-left: 2px solid #ccc;
}

.dark .custom-timeline .p-timeline-event {
  border-left: 2px solid #555;
}

.dark .custom-timeline .p-timeline-event-opposite {
  color: white;
}
.light .custom-timeline .p-timeline-event-opposite {
  color: black;
}

.dark .custom-timeline .p-timeline-event-marker {
  border: 2px solid #555;
}

/* General styles for AccordionTab */
.light-mode-accordion-tab {
  background-color: white;
  color: black;
}

.dark-mode-accordion-tab {
  background-color: #262626;
  color: white;
}

.light-mode-accordion-tab .p-accordion-tab {
  background-color: white;
  color: black;
  border: 1px solid #ccc;
}

.dark-mode-accordion-tab .p-accordion-tab {
  background-color: #262626;
  color: white;
  border: 1px solid #555;
}

.light-mode-accordion-tab .p-accordion-tab-header {
  background-color: white;
  color: black;
}

.dark-mode-accordion-tab .p-accordion-tab-header {
  background-color: #262626;
  color: white;
}

.light-mode-accordion-tab .p-accordion-tab-header:hover {
  background-color: #f0f0f0;
  color: black;
}

.dark-mode-accordion-tab .p-accordion-tab-header:hover {
  background-color: #3e3e3e;
  color: white;
}

.light-mode-accordion-tab .p-accordion-tab-content {
  background-color: white;
  color: black;
}

.dark-mode-accordion-tab .p-accordion-tab-content {
  background-color: #262626;
  color: white;
}

/* General styles for Timeline */
.light-mode-timeline {
  background-color: white;
  color: black;
}

.dark-mode-timeline {
  background-color: #0a0a0a;
  color: white;
}

.light-mode-timeline .p-timeline-event {
  border-left: 2px solid #ccc;
}

.dark-mode-timeline .p-timeline-event {
  border-left: 2px solid #555;
}

.light-mode-timeline .p-timeline-event-opposite {
  color: black;
}

.dark-mode-timeline .p-timeline-event-opposite {
  color: white;
}

.light-mode-timeline .p-timeline-event-content {
  color: black;
}

.dark-mode-timeline .p-timeline-event-content {
  color: white;
}

.light-mode-timeline .p-timeline-event-marker {
  background-color: white;
  border: 2px solid #ccc;
}

.dark-mode-timeline .p-timeline-event-marker {
  background-color: #262626;
  border: 2px solid #555;
}
</style>
<script>
import '../assets/tailwind.css'
import { ConstantColorFactor } from 'three'

export default {
  data() {
    return {
      value: 223
      // Other data properties
    }
  }
}
</script>

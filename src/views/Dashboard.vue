<script setup>
import { useDark } from '@vueuse/core'
import InputText from 'primevue/inputtext'
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { supabase } from '../supabase'
import { format, parseISO } from 'date-fns'
import { geneticAlgorithm } from '../../supabase/functions/packing/algorithm'
import RadioButton from 'primevue/radiobutton'

const isDark = useDark()
const chartData = ref({
  labels: [],
  datasets: []
})

const fitnessData = ref({
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
const maxDeliveries = ref(0)
const knobValueDelivered = ref(0)

// const router = useRouter()

const selectedDataType = ref('shipments')

const displayedChartData = computed(() => {
  if (selectedDataType.value === 'shipments') {
    return chartData.value
  } else {
    // Transform delivery data into a format suitable for a pie chart
    const statusCounts = {
      Processing: deliveries.value.filter((d) => d.Status == 'Processing').length,
      Shipped: deliveries.value.filter((d) => d.Status === 'Shipped').length,
      Ordered: deliveries.value.filter((d) => d.Status === 'Ordered').length
    }
    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ['#f97316', '#5b21b6', '#262626']
        }
      ]
    }
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: selectedDataType.value === 'shipments' ? 'Shipment Overview' : 'Delivery Overview',
      font: {
        size: 16
      }
    },
    legend: {
      position: 'bottom'
    }
  }
}))

async function checkProcessing() {
  try {
    await supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Shipment', filter: 'Status=eq.Processing' },
        (payload) => {
          console.log('New or updated Processing Shipment:', payload.new.id)
          uploadSoltuion(payload.new.id)
        }
      )
      .subscribe()
    // console.log('Subscription set up successfully')
  } catch (error) {
    console.error('Error setting up subscription:', error)
  }
}
const containerDimensions = [1000, 1930, 1200] // defualt truck

async function uploadSoltuion(shipmentId) {
  const { data, error } = await supabase.functions.invoke('packing', {
    body: JSON.stringify({
      type: 'getPackages',
      ShipmentID: shipmentId
    }),
    method: 'POST'
  })
  const result = await data.data
  if (error) {
    console.error('Error fetching packages for shipment', error.message)
  } else {
    const Solution = await geneticAlgorithm(result, containerDimensions, 150, 300, 0.01)
    const stringSOl = JSON.stringify(Solution)
    console.log('RESULT GOING INTO INVOKE:', stringSOl)
    const { data, error } = await supabase.functions.invoke('packing', {
      body: JSON.stringify({
        type: 'uploadSolution',
        shipmentID: shipmentId,
        solutions: stringSOl
      }),
      method: 'POST'
    })
    if (error) {
      console.error('Error uploading calculated Solution', error)
    } else {
      console.log('Successfully uploaded solution')
    }
  }
}

let userName
async function getUsername() {
  const { data } = await supabase.auth.getSession()
  userName = data.session.user.identities[0].identity_data.name
}
async function setupSubscription() {
  try {
    await supabase
      .channel('custom-all-channel2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Deliveries' }, (payload) => {
        getAllDeliveries()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Shipment' }, (payload) => {
        getAllShipments()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Packages' }, (payload) => {
        getAllPackages()
      })
      .subscribe()
  } catch (error) {
    console.error(error, 'setupSubscription')
  }
}

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

      const fitnessValues = []

      data.data.forEach((shipment) => {
        const status = shipment.Status.trim()
        if (statusCounts[status] !== undefined) {
          statusCounts[status]++
        }

        // Parse fitness value and add it to the array
        const fitness = parseFloat(shipment.Fitness_Value)
        if (!isNaN(fitness)) {
          fitnessValues.push({
            x: statusCounts[status], // Use status count as x-axis
            y: fitness // Use fitness value as y-axis
          })
        }
      })

      // Calculate linear regression
      const { slope, intercept } = calculateLinearRegression(fitnessValues)

      // Generate trendline data
      const trendlineData = generateTrendlineData(fitnessValues, slope, intercept)

      chartData.value = {
        labels: ['Processing', 'Shipped', 'Delivered'],
        datasets: [
          {
            label: 'Shipments Status',
            data: [statusCounts.Processing, statusCounts.Shipped, statusCounts.Delivered],
            backgroundColor: ['#f97316', '#5b21b6', '#262626']
          }
        ]
      }

      fitnessData.value = {
        datasets: [
          {
            label: 'Fitness Value vs Shipment Count',
            data: fitnessValues,
            backgroundColor: '#8b5cf6',
            type: 'scatter'
          },
          {
            label: 'Trendline',
            data: trendlineData,
            type: 'line',
            borderColor: '#ea580c',
            borderWidth: 2,
            fill: false,
            pointRadius: 0
          }
        ]
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Function to calculate linear regression
function calculateLinearRegression(data) {
  const n = data.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0

  for (let i = 0; i < n; i++) {
    sumX += data[i].x
    sumY += data[i].y
    sumXY += data[i].x * data[i].y
    sumXX += data[i].x * data[i].x
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

// Function to generate trendline data
function generateTrendlineData(data, slope, intercept) {
  const minX = Math.min(...data.map((point) => point.x))
  const maxX = Math.max(...data.map((point) => point.x))

  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ]
}
const getAllPackages = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getAllPackages' }),
      method: 'POST'
    })

    if (error) {
      console.log('API Error:', error)
    } else {
      const count = data.data.length
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
      maxDeliveries.value = deliveries.value.length // Ensure maxDeliveries is a number
      knobValueDelivered.value = deliveries.value.filter(
        (delivery) => delivery.Status === 'Shipped'
      ).length // Ensure knobValueDelivered is a number
      updateChartData()
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const updateChartData = () => {
  const monthCounts = {}

  deliveries.value.forEach((delivery) => {
    const month = format(parseISO(delivery.Start_time), 'MMMM yyyy')
    monthCounts[month] = (monthCounts[month] || 0) + 1
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
}
const events = [
  { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
  { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9900' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
]

onMounted(() => {
  getUsername()
  getAllShipments()
  getAllPackages()
  getAllDeliveries()
  setupSubscription()
  checkProcessing()
})
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900 text-white' : 'bg-gray-200 text-black',
      'w-full h-full flex flex-row shadow-lg'
    ]"
  >
    <Sidebar />
    <div class="flex flex-col p-4 ml-2 w-full">
      <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
        <span class="font-bold">Welcome back</span>
      </h2>
      <div class="flex flex-wrap mb-4">
        <div class="justify-center w-full mb-4 flex flex-wrap gap-4 md:flex-nowrap">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full md:w-[50%] h-auto'
            ]"
          >
            <div class="flex justify-between items-center mb-4">
              <h2 class="font-bold">Overview</h2>
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <RadioButton
                    v-model="selectedDataType"
                    inputId="shipments"
                    name="dataType"
                    value="shipments"
                  />
                  <label for="shipments" class="ml-2">Shipments</label>
                </div>
                <div class="flex items-center">
                  <RadioButton
                    v-model="selectedDataType"
                    inputId="deliveries"
                    name="dataType"
                    value="deliveries"
                  />
                  <label for="deliveries" class="ml-2">Deliveries</label>
                </div>
              </div>
            </div>
            <div class="flex justify-center items-center w-full h-full">
              <div class="w-[300px] h-[300px]">
                <Chart
                  type="pie"
                  :data="displayedChartData"
                  :options="chartOptions"
                  class="h-full w-full"
                />
              </div>
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

        <div class="w-full mb-4 gap-4 flex flex-col sm:flex-row">
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
                :max="500"
                valueColor="#f97316"
                :rangeColor="isDark ? 'White' : 'Black'"
                :class="[isDark ? 'dark' : 'light']"
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
                :max="maxDeliveries"
                valueColor="#f97316"
                :rangeColor="isDark ? 'White' : 'Black'"
                :class="[isDark ? 'dark' : 'light']"
              />
              <div class="ml-4 flex flex-col">
                <h2 class="mb-1 font-bold">Shipped</h2>
                <p class="font-light">{{ knobValueDelivered }}/{{ maxDeliveries }}</p>
                <h2 class="mb-1 font-bold">In Progress</h2>
                <p class="mb-1 font-light">{{ maxDeliveries - knobValueDelivered }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full sm:w-[50%] flex flex-wrap mb-4">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex flex-col p-4 rounded-xl w-full h-auto'
            ]"
          >
            <h2 class="mb-6 font-bold">Fitness Value</h2>
            <div class="flex justify-center items-center w-full h-full">
              <Chart type="scatter" :data="fitnessData" class="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
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

<script setup>
import { useDark } from '@vueuse/core'
// import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

const isDark = useDark()
// const toggleDark = () => {
//   isDark.value = !isDark.value
//   console.log('Dark mode:', isDark.value ? 'on' : 'off')
// }
const chartData = ref({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      type: 'bar',
      label: 'Sales',
      backgroundColor: '#82ca9d',
      data: [50, 25, 12, 48, 56, 76, 42]
    }
  ]
})
const events = [
  { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
  { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9900' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
]

const chartOptions = ref({
  scales: {
    y: {
      beginAtZero: true
    }
  }
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
      <div class="w-full md:w-[300px] mb-4">
        <div
          :class="[
            isDark ? 'border-neutral-500 bg-neutral-900 text-white' : 'border-gray-500 bg-white text-black',
            'border flex items-center px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-yellow-600'
          ]"
        >
          <i :class="[isDark ? 'text-white' : 'text-black','pi pi-search mr-2']"></i>
          <InputText
            placeholder="Search"
            :class="[
              isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black',
              'focus:outline-none focus:ring-0'
            ]"
          />
        </div>
      </div>
      <h2 :class="[isDark ? 'text-yellow-600' : 'text-black', 'my-4 font-normal text-3xl']">
        <span class="font-bold">Welcome back</span>, John
      </h2>
      <div class="flex flex-wrap mb-4">
        <div class="w-full md:w-[55%] mb-4">
          <div :class="[isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black', 'p-4 rounded-xl h-full flex flex-col']">
            <h2 class="font-bold mb-6">Shipment Overview</h2>
            <div class="w-full flex-grow">
              <Chart type="line" :data="chartData" :options="chartOptions" class="h-full w-full" />
            </div>
          </div>
        </div>

        <div class="w-full ml-2 md:w-[43%] mb-4 flex flex-col">
          <div :class="[isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black', 'flex-grow p-4 rounded-xl flex flex-col mb-4']">
            <h2 class="mb-1 text-xl font-bold">Current Shipments</h2>
            <div class="flex flex-row flex-grow items-center">
              <Knob v-model="value" valueColor="SlateGray" rangeColor="Purple" class="flex-grow-0" />
              <div class="ml-4 flex flex-col">
                <h2 class="mb-1 font-bold">Completed</h2>
                <p class="font-light">223/300</p>
                <h2 class="mb-1 font-bold">In Progress</h2>
                <p class="mb-1 font-light">73</p>
              </div>
            </div>
          </div>

          <div :class="[isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black', 'flex-grow p-4 rounded-xl flex flex-col']">
            <h2 class="mb-1 text-xl font-bold">Current Shipments</h2>
            <div class="flex flex-row flex-grow items-center">
              <Knob v-model="value" valueColor="SlateGray" rangeColor="Purple" class="flex-grow-0" />
              <div class="ml-2 flex flex-col">
                <h2 class="mb-1 font-bold">Completed</h2>
                <p class="font-light">223/300</p>
                <h2 class="mb-1 font-bold">In Progress</h2>
                <p class="mb-1 font-light">73</p>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full flex flex-wrap mb-4">
          <!-- Latest Shipment -->
          <div class="w-full md:w-[49%] mb-4 mr-2 flex flex-col">
            <div :class="[isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black', 'p-4 rounded-xl']">
              <h2 class="font-bold mb-6">Latest Shipment</h2>
              <div :class="[isDark ? 'text-neutral-400' : 'text-neutral-900']">
                <Accordion :activeIndex="0" class="w-full">
                  <AccordionTab v-for="item in [1, 2, 3]" :key="item" :header="`Shipment #344${item}`">
                    <Timeline :value="events">
                      <template #opposite="slotProps">
                        <small class="p-text-secondary">{{ slotProps.item.date }}</small>
                      </template>
                      <template #content="slotProps">
                        {{ slotProps.item.status }}
                      </template>
                    </Timeline>
                  </AccordionTab>
                </Accordion>
              </div>
            </div>
          </div>
          <!-- Calendar -->
          <div class="w-full md:w-[49%] mb-4 flex flex-col">
            <div :class="[isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black', 'p-4 rounded-xl']">
              <h2 class="font-bold mb-6">Calendar</h2>
              <div class="flex-grow">
                <Calendar v-model="date" inline :class="[isDark ? 'calendar-dark' : 'calendar-light']" showWeek />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* General styles */
</style>

<script setup>
import { useDark /*, useToggle */ } from '@vueuse/core'
// import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { supabase } from '../supabase'
const isDark = useDark()
// const toggleDark = () => {
//   isDark.value = !isDark.value
//   console.log('Dark mode:', isDark.value ? 'on' : 'off')
// }

const chartData = ref({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Algorithm 1',
      data: [1, 2, 1, 3, 3, 2, 1],
      borderColor: '#f5a142',
      backgroundColor: '#000000'
    },
    {
      label: 'Algorithm 2',
      data: [2, 3, 1, 2, 2, 1, 1],
      borderColor: '#4300a1',
      backgroundColor: '#000000'
    }
  ],
  options: {
    scales: {
      x: {
        grid: {
          color: 'red' // Change the color of the x-axis grid lines
        }
      },
      y: {
        grid: {
          color: 'blue' // Change the color of the y-axis grid lines
        }
      }
    }
  }
})

const events = [
  { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
  { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9900' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
]

const chartOptions = ref({
  scales: {
    x: {
      grid: {
        color: isDark.value ? '#474647' : 'rgba(0, 0, 0, 0.1)' // Dynamic color based on theme
      }
    },
    y: {
      grid: {
        color: isDark.value ? '#474647' : 'rgba(0, 0, 0, 0.1)' // Dynamic color based on theme
      },
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
            isDark
              ? 'border-neutral-500 bg-neutral-900 text-white'
              : 'border-gray-500 bg-white text-black',
            'border flex items-center px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-yellow-600'
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
        <span class="font-bold">Welcome back</span>
      </h2>
      <div class="flex flex-wrap mb-4">
        <div class="w-full md:w-[55%] mb-4">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'p-4 rounded-xl h-full flex flex-col'
            ]"
          >
            <h2 class="mb-6 font-bold">Shipment Overview</h2>
            <div class="w-full flex-grow">
              <Chart type="line" :data="chartData" :options="chartOptions" class="h-full w-full" />
            </div>
          </div>
        </div>

        <div class="w-full ml-2 md:w-[43%] mb-4 flex flex-col">
          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex-grow p-4 rounded-xl flex flex-col mb-4'
            ]"
          >
            <h2 class="mb-1 text-xl font-bold">Current Shipments</h2>
            <div class="flex flex-row flex-grow items-center">
              <Knob
                v-model="value"
                valueColor="Orange"
                rangeColor="Black"
                :class="[isDark ? 'dark' : 'light']"
              />
              <div class="ml-4 flex flex-col">
                <h2 class="mb-1 font-bold">Completed</h2>
                <p class="font-light">223/300</p>
                <h2 class="mb-1 font-bold">In Progress</h2>
                <p class="mb-1 font-light">73</p>
              </div>
            </div>
          </div>

          <div
            :class="[
              isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
              'flex-grow p-4 rounded-xl flex flex-col'
            ]"
          >
            <h2 class="mb-1 text-xl font-bold">Current Shipments</h2>
            <div class="flex flex-row flex-grow items-center">
              <Knob
                v-model="value"
                valueColor="Orange"
                rangeColor="Black"
                class="flex-grow-0"
                :class="[isDark ? 'dark' : 'light']"
              />
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
            <div
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'p-4 rounded-xl'
              ]"
            >
              <h2 class="mb-6 font-bold">Latest Shipment</h2>
              <div :class="[isDark ? 'dark text-neutral-400' : 'light text-neutral-900']">
                <Accordion :activeIndex="0" class="custom-accordion w-full">
                  <AccordionTab
                    v-for="item in [1, 2, 3]"
                    :key="item"
                    :header="`Shipment #344${item}`"
                    :class="isDark ? 'dark-mode-accordion-tab' : 'light-mode-accordion-tab'"
                  >
                    <Timeline
                      :value="events"
                      :class="isDark ? 'dark-mode-timeline' : 'light-mode-timeline'"
                    >
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
            <div
              :class="[
                isDark ? 'bg-neutral-950 text-white' : 'bg-white text-black',
                'p-4 rounded-xl'
              ]"
            >
              <h2 class="font-bold mb-6">Calendar</h2>
              <div class="flex-grow">
                <Calendar
                  id="calendar"
                  v-model="date"
                  inline
                  showWeek
                  :class="[isDark ? 'dark-calendar' : 'light-calendar']"
                />
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

.custom-accordion .p-accordion-content {
  background-color: inherit;
  color: inherit;
}

.custom-timeline {
  background-color: inherit;
  color: inherit;
}

.custom-timeline .p-timeline-event {
  border-left: 2px solid #ccc;
}

.dark .custom-timeline .p-timeline-event {
  border-left: 2px solid #555;
}

.custom-timeline .p-timeline-event-opposite {
  color: inherit;
}

.custom-timeline .p-timeline-event-content {
  color: inherit;
}

.custom-timeline .p-timeline-event-marker {
  background-color: inherit;
  border: 2px solid #ccc;
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

export default {
  data() {
    return {
      value: 223
      // Other data properties
    }
  }
}
</script>
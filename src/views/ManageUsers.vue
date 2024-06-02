<script setup>
import { useDark /*, useToggle*/ } from '@vueuse/core'
// import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { ref, onMounted /*, onUnmounted*/ } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
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
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}
const customers = ref([]) // Reactive variable to store customer data

onMounted(async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'GetAllUsers' }),
      method: 'POST'
    })

    if (error) {
      console.log('API Error:', error)
    } else {
      customers.value = JSON.parse(data).data
      console.log(customers.value) // Now it should log an array
    }
  } catch (error) {
    console.error('Error fetching data:', error)
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
      <h2 :class="[isDark ? 'text-yellow-600' : 'text-black', 'my-4 font-normal text-3xl']">
        <span class="font-bold">Manage User's</span>
      </h2>

      <!-- Users Table -->
      <div>
        <DataTable
          :class="[isDark ? 'dark' : '']"
          :value="customers"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column field="FullName" header="Full Name" style="width: 25%"></Column>
          <Column field="Email" header="Email" style="width: 25%"></Column>
          <Column field="Role" header="Role" style="width: 25%"></Column>
          <Column field="Phone" header="Phone Number" style="width: 25%"></Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

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
  background-color: #262626;
  color: white;
}

.dark .p-datatable-header {
  background-color: #333333;
  color: white;
}

.dark .p-datatable-thead > tr > th,
.dark .p-datatable-tfoot > tr > th {
  background-color: #333333;
  color: white;
}

.dark .p-datatable-tbody > tr {
  background-color: #262626;
  color: white;
}

.dark .p-datatable-tbody > tr:nth-child(even) {
  background-color: #333333;
}

.dark .p-datatable-tbody > tr:hover {
  background-color: #444444;
}

.dark .p-datatable-footer {
  background-color: #333333;
  color: white;
}

.dark .p-paginator {
  background-color: #333333;
  color: white;
}
.dark .p-paginator .p-dropdown {
  background-color: #333333 !important;
  color: #333333 !important;
  border: 1px solid #333333 !important;
}
.dark .p-paginator .p-dropdown .p-dropdown-trigger {
  color: rgb(255, 145, 0);
  background-color: #333333;
}

.dark .p-paginator .p-inputtext {
  background: #333333 !important;
  color: white !important;
}

.dark .p-dropdown-panel {
  background: #333333;
}
.dark .p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
  color: rgb(255, 145, 0);
  background-color: #333333;
}
.dark
  .p-dropdown-panel
  .p-dropdown-items
  .p-dropdown-item:not(.p-highlight):not(.p-disabled).p-focus {
  color: rgb(255, 145, 0);
  background-color: #333333;
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
</style>

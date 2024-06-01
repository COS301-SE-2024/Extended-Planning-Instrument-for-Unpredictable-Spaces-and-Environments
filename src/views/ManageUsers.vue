<script setup>
import { useDark/*, useToggle*/ } from '@vueuse/core'
// import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { ref, onMounted/*, onUnmounted*/ } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
// SUPA BASE
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://rgisazefakhdieigrylb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXNhemVmYWtoZGllaWdyeWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzMTMxNTEsImV4cCI6MjAzMTg4OTE1MX0.xNhTpM5Qxz8sHW0JPFSoFaWAtI425QPoI17jofYxoFA";
// SUPA BASE
const supabase = createClient(supabaseUrl, supabaseKey);
const isDark = useDark()
// const toggleDark = () => {
//   isDark.value = !isDark.value
//   console.log('Dark mode:', isDark.value ? 'on' : 'off')
// }
const customers = ref([])  // Reactive variable to store customer data

onMounted(async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'GetAllUsers' }),
      method: 'POST'
    });

    if (error) {
      console.log('API Error:', error);
    } else {
      customers.value = JSON.parse(data).data;  
      console.log(customers.value); // Now it should log an array
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
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
        <span class="font-bold">Manage User's</span>
      </h2>

      <!-- Users Table -->
      <DataTable
        :value="customers"
        paginator
        stripedRows
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        :class="isDark ? 'datatable-dark' : 'datatable-light'"
      >
        <Column field="FullName" header="Full Name"></Column>
        <Column field="Email" header="Email"></Column>
        <Column field="Role" header="Role"></Column>
        <Column field="Phone" header="Phone Number"></Column>
      </DataTable>
    </div>
  </div>
</template>

<style>
/* General styles */
</style>

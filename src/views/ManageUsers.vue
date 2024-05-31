<script setup>
import { useDark, useToggle } from '@vueuse/core'
import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
const isDark = useDark()
const toggleDark = () => {
  isDark.value = !isDark.value
  console.log('Dark mode:', isDark.value ? 'on' : 'off')
}
</script>

<template>
  <div
    :class="[
      isDark ? 'dark bg-neutral-900' : 'bg-gray-100',
      'w-full h-full flex flex-row shadow-lg'
    ]"
  >
    <Sidebar />
    <!-- Main Content -->
    <div class="flex flex-col p-4 ml-2 w-full">
      <!-- Search Input -->
      <div class="w-full md:w-[300px] mb-4">
        <div
          class="border border-neutral-500 flex items-center bg-neutral-900 px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-yellow-600"
        >
          <i class="pi pi-search text-white mr-2"></i>
          <InputText
            placeholder="Search"
            class="bg-neutral-900 text-white focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <h2 class="my-4 font-normal text-3xl"><span class="font-bold">Manage User's</span></h2>

      <!-- Users Table -->
      <DataTable
        :value="customers"
        paginator
        stripedRows
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
      >
        <Column field="name" header="Full Name"></Column>
        <Column field="category" header="Email"></Column>
        <Column field="role" header="Role"></Column>
        <Column field="number" header="Phone Number"></Column>
      </DataTable>
    </div>
  </div>
</template>

<style>
/* General styles */
</style>

<script setup>
import { useDark } from '@vueuse/core'
import InputText from 'primevue/inputtext'
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import DialogComponent from '@/components/DialogComponent.vue'
import { FilterMatchMode } from 'primevue/api'
import { supabase } from '@/supabase.js' // Import the Supabase client
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
const isDark = useDark()
const customers = ref([]) // Reactive variable to store customer data
const dialogVisible = ref(false)
const toast = useToast()

// Utility to sanitize input
const sanitizeInput = (input) => {
  const trimmedInput = input.trim()
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(trimmedInput))
  return div.innerHTML
}

// Search functionality
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const onGlobalFilterChange = (e) => {
  filters.value.global.value = sanitizeInput(e.target.value)
}

const handleDelete = (oldUserData) => {
  const index = customers.value.findIndex((user) => user.id === oldUserData.id)
  if (index !== -1) {
    customers.value.splice(index, 1)
  }
}

const currentUser = ref(null)

const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error.message)
  // Optionally send the error to an external logging service
}

const checkUserPermissions = (user) => {
  return true // Assuming all authenticated users have permission for this example
}

async function fetchCurrentUser() {
  try {
    const session = await supabase.auth.getSession()
    if (session.data.session) {
      const { user } = session.data.session
      if (checkUserPermissions(user)) {
        const { data, error } = await supabase.functions.invoke('core', {
          body: JSON.stringify({ type: 'getNameByEmail', email: sanitizeInput(user.email) }),
          method: 'POST'
        })

        if (error) {
          handleError(error, 'fetchCurrentUser')
        } else {
          currentUser.value = data.data
          // console.log('Current user:', currentUser.value) // Debugging statement
        }
      } else {
        console.log('User does not have permission')
      }
    } else {
      console.log('No session found')
    }
  } catch (error) {
    handleError(error, 'fetchCurrentUser')
  }
}

async function setupSubscription() {
  try {
    await supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Users' }, (payload) => {
        handleInsertOrUpdate(payload.new)
        // console.log('Inserted:', payload.new)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Users' }, (payload) => {
        handleInsertOrUpdate(payload.new)
        // console.log('Updated:', payload.new)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Users' }, (payload) => {
        handleDelete(payload.old)
        // console.log('Deleted:', payload.old)
      })
      .subscribe()
  } catch (error) {
    handleError(error, 'setupSubscription')
  }
}

const handleInsertOrUpdate = (newUserData) => {
  const index = customers.value.findIndex((user) => user.id === newUserData.id)
  if (index !== -1) {
    customers.value[index] = newUserData
  } else {
    customers.value.push(newUserData)
  }
}

const fetchUsers = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'getAllUsers' }),
      method: 'POST'
    })

    if (error) {
      handleError(error, 'fetchUsers')
    } else {
      customers.value = data.data
    }
  } catch (error) {
    handleError(error, 'fetchUsers')
  }
}
const DelteUser = async () => {
  loadingDel.value = true
  const sanitizedEmail = sanitizeInput(selectedUser.value.Email)
  try {
    const { data, error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({ type: 'deleteUser', email: sanitizedEmail }),
      method: 'POST'
    })

    if (error) {
      console.log(error)
      dialogVisible.value = false
      handleError(error, 'deleteUser')
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 10000
      })
    } else {
      console.log('DELETED USER')
      dialogVisible.value = false
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'You have successfully deleted user the user',
        life: 50000
      })
    }
  } catch (error) {
    handleError(error, 'deleteUser')
  } finally {
    loadingDel.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchCurrentUser() // Fetch current user info on mount
  setupSubscription()
})

const selectedUser = ref({
  FullName: '',
  Email: '',
  Role: '',
  Phone: ''
})
const selectedRole = ref(null)

const loading = ref(false)
const loadingDel = ref(false)

const onRemoveThing = (user) => {
  selectedUser.value = { ...user }
  selectedRole.value = roles.value.find((role) => role.name === user.Role) || null
  dialogVisible.value = true
}
const roles = ref([
  { name: 'Manager', code: 'Manager' },
  { name: 'Packer', code: 'Packer' },
  { name: 'Driver', code: 'Driver' },
  { name: 'unassigned', code: 'unassigned' }
])

const saveChanges = async () => {
  loading.value = true
  try {
    const sanitizedFullName = sanitizeInput(selectedUser.value.FullName)
    const sanitizedEmail = sanitizeInput(selectedUser.value.Email)
    const sanitizedPhone = sanitizeInput(selectedUser.value.Phone)

    const { error } = await supabase.functions.invoke('core', {
      body: JSON.stringify({
        type: 'updateUser',
        fullname: sanitizedFullName,
        email: sanitizedEmail,
        role: sanitizeInput(selectedRole.value.name),
        phone: sanitizedPhone
      }),
      method: 'POST'
    })

    if (error) {
      handleError(error, 'saveChanges')
    } else {
      dialogVisible.value = false
    }
  } catch (error) {
    handleError(error, 'saveChanges')
  } finally {
    loading.value = false
  }
}

const nameWithYou = (user) => {
  // console.log('Function called for user:', user) // Debugging statement
  if (currentUser.value && currentUser.value.email === user.email) {
    return `${user.FullName} (You)`
  }
  return user.FullName
}
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
            v-model="filters['global'].value"
            placeholder="Search"
            @input="onGlobalFilterChange"
            :class="[
              isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black',
              'focus:outline-none focus:ring-0'
            ]"
          />
        </div>
      </div>
      <h2 :class="[isDark ? 'text-white' : 'text-black', 'my-4 font-normal text-3xl']">
        <span class="font-bold">Manage Users</span>
      </h2>

      <!-- Users Table -->
      <div>
        <DataTable
          :class="[isDark ? 'dark' : '']"
          :value="customers"
          paginator
          :rows="5"
          :filters="filters"
          :globalFilterFields="['FullName', 'Email', 'Role', 'Phone']"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column field="FullName" header="Full Name" style="width: 25%">
            <template #body="slotProps">
              {{ nameWithYou(slotProps.data) }}
            </template>
          </Column>
          <Column field="Email" header="Email" style="width: 25%"></Column>
          <Column field="Role" header="Role" style="width: 25%"></Column>
          <Column field="Phone" header="Phone Number" style="width: 25%"></Column>

          <Column header="Edit" style="width: 25%">
            <template #body="slotProps">
              <Button
                class="bg-orange-500 text-gray-100 rounded-lg p-2"
                label="Edit"
                @click="onRemoveThing(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
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
        isDark ? 'text-white bg-neutral-800' : ' bg-white text-neutral-800',
        'mt-2  form-control w-full px-3  pt-6 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
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
            'mt-2   form-control w-full px-3 py-2 rounded-lg focus:outline-none  focus:border-orange-500' // Changes here
          ]"
          v-model="selectedUser.Phone"
          id="Phone"
        />
      </div>
      <div class="mt-6 flex flex-col items-center align-center">
        <Button
          label="Save"
          class="w-full font-semibold p-button-text text-white bg-green-800 rounded-lg p-2 mb-2"
          :loading="loading"
          @click="saveChanges"
        />
        <Button
          label="Delete User"
          class="w-full font-semibold p-button-text text-white bg-red-800 rounded-lg p-2 mb-2"
          :loading="loadingDel"
          @click="DelteUser"
        />
        <Button
          icon="pi pi-arrow-left"
          iconPos="left"
          label="Back"
          class="font-semibold w-auto p-button-text text-orange-500 p-2"
          @click="dialogVisible = false"
        />
      </div>
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
  <Toast />
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
  border-radius: 0.375rem;
}

.dark .p-dialog .p-dialog-content {
  background-color: #171717;
  color: white;
  border-radius: 0.375rem;
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

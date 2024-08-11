import { mount } from '@vue/test-utils';
import Inventory from '../../views/Inventory.vue';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import ToastService from 'primevue/toastservice';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { createRouter, createWebHistory, RouterLinkStub } from 'vue-router';
import Dropdown from 'primevue/dropdown'; // Import the Dropdown component
import Menu from 'primevue/menu';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import DialogComponent from '@/components/DialogComponent.vue'; // Assuming it's properly set up

// Mocking Supabase
vi.mock('@/supabase.js', () => ({
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: { email: 'test@example.com' } } } }),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { FullName: 'John Doe', Role: 'Admin' } }), // Mock the single method
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: { data: [{ id: 1, Shipment_id: 'SH001', Weight: 10, Packed_time: '2023-08-01T12:34:56Z', Width: 10, Length: 20, Height: 5, Volume: 100 }] },
        }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }),
    },
  }));

// Mock useToast
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn().mockReturnValue({
    add: vi.fn(),
  }),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe('Inventory.vue', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(Inventory, {
      global: {
        plugins: [PrimeVue, ToastService, router],
        components: {
          InputText, DataTable, Column, Dialog, Dropdown, Menu, Badge, Avatar, FileUpload, Button, Toast, DialogComponent,
        },
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    });
    await wrapper.vm.$nextTick();
  });

  it('renders the Inventory component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('fetches and displays packages on mount', async () => {
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    expect(rows.length).toBe(1);
    expect(rows[0].text()).toContain('SH001');
  });

  it('updates search query when input is changed', async () => {
    const input = wrapper.find('input.p-inputtext');
    await input.setValue('SearchText');
    expect(wrapper.vm.filters.global.value).toBe('SearchText');
  });

  it('toggles dark mode', async () => {
    const initialMode = wrapper.vm.isDark;
    wrapper.vm.toggleDark();
    expect(wrapper.vm.isDark).toBe(!initialMode);
  });

  it('opens the dialog when Help link is clicked', async () => {
    const helpLink = wrapper.find('p.text-orange-500');
    await helpLink.trigger('click');
    await wrapper.vm.$nextTick(); // Wait for the next DOM update
    expect(wrapper.vm.dialogVisible).toBe(false);
  });
  
});

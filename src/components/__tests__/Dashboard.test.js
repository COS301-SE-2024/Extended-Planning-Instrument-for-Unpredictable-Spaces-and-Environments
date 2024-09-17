import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useDark, useToggle } from '@vueuse/core';
import Dashboard from '../../views/Dashboard.vue';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import { supabase } from '../../supabase';

// Mocking necessary modules and components
vi.mock('@vueuse/core', () => {
  const actual = vi.importActual('@vueuse/core');
  return {
    ...actual,
    useDark: vi.fn(),
    useToggle: vi.fn(),
  };
});

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              identities: [{
                identity_data: {
                  name: 'Test User',
                },
              }],
            },
          },
        },
      }),
    },
    functions: {
      invoke: vi.fn().mockImplementation(async (fn, { body }) => {
        const requestBody = JSON.parse(body);
        if (requestBody.type === 'getAllShipments') {
          return {
            data: {
              data: [
                { Status: 'Processing', Fitness_Value: '0.5' },
                { Status: 'Shipped', Fitness_Value: '0.7' },
                { Status: 'Delivered', Fitness_Value: '0.9' }
              ]
            }
          };
        } else if (requestBody.type === 'getAllPackages') {
          return {
            data: {
              data: [{}, {}, {}]
            }
          };
        } else if (requestBody.type === 'getAllDeliveries') {
          return {
            data: {
              data: [
                { Status: 'Delivered', Start_time: '2023-01-01T00:00:00Z' },
                { Status: 'In Progress', Start_time: '2023-02-01T00:00:00Z' }
              ]
            }
          };
        }
      })
    }
  },
}));

describe('Dashboard Component', () => {
  let isDarkMock;
  let toggleDarkMock;

  beforeEach(() => {
    isDarkMock = ref(false);
    toggleDarkMock = vi.fn();

    useDark.mockReturnValue(isDarkMock);
    useToggle.mockReturnValue(toggleDarkMock);

    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return mount(Dashboard, {
      global: {
        plugins: [PrimeVue],
        stubs: {
          InputText,
          Sidebar: { template: '<div class="sidebar"></div>' },
          Knob: { template: '<div></div>' },
          Chart: { template: '<div></div>' },
          Badge: { template: '<div></div>' },
          Menu: { template: '<div></div>' },
          Avatar: { template: '<div></div>' },
          FileUpload: { template: '<div></div>' },
          Button: { template: '<div></div>' },
          Dialog: { template: '<div></div>' },
          'router-link': { template: '<div></div>' }, // Mocking router-link component
        },
        provide: {
          PrimeVueToast: { show: () => {} }, // Mocking PrimeVue Toast
        },
      },
      data() {
        return {
          date: new Date(),
          scatterOptions: {}, // Define scatterOptions here
          shipments: [
            { date: '2024-01-01', status: 'Processing' },
            { date: '2024-02-01', status: 'Shipped' },
            { date: '2024-03-01', status: 'Delivered' }
          ],
          packages: [
            { id: 1, name: 'Package 1' },
            { id: 2, name: 'Package 2' }
          ],
          deliveries: [
            { date: '2024-01-01', status: 'Processing' },
            { date: '2024-02-01', status: 'Shipped' },
            { date: '2024-03-01', status: 'Delivered' }
          ] // Mocked deliveries data
        };
      },
    });
  };

  it('renders dark mode correctly', async () => {
    isDarkMock.value = true;
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.find('.dark').exists()).toBe(true);
    expect(wrapper.find('.dark').classes()).toContain('bg-neutral-900');
  });

  it('renders light mode correctly', async () => {
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.find('.bg-gray-100').exists()).toBe(false);
    expect(wrapper.find('.text-black').exists()).toBe(true);
  });

 
  it('renders the sidebar component', () => {
    const wrapper = createWrapper();
    const sidebar = wrapper.find('.sidebar');
    expect(sidebar.exists()).toBe(true);
  });

});

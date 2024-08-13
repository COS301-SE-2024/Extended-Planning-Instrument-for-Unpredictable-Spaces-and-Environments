import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Timeline from 'primevue/timeline';
import Card from 'primevue/card';
import { supabase } from '@/supabase';
import Tracking from '../../views/Tracking.vue'; // Update with correct component name/path

// Mocking necessary modules and components
vi.mock('@vueuse/core', () => {
  const actual = vi.importActual('@vueuse/core');
  return {
    ...actual,
    useDark: vi.fn(),
  };
});

vi.mock('@/supabase', () => ({
    supabase: {
      functions: {
        invoke: vi.fn().mockResolvedValue({
          data: {
            data: [
              { Status: 'Processing', Fitness_Value: '0.5' },
              { Status: 'Shipped', Fitness_Value: '0.7' },
              { Status: 'Delivered', Fitness_Value: '0.9' }
            ]
          }
        }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnValue({
          subscribe: vi.fn(),
        }),
      }), // Mocking the channel method
    },
  }));

describe('Tracking Component', () => {
  let isDarkMock;

  beforeEach(() => {
    isDarkMock = ref(false);

    useDark.mockReturnValue(isDarkMock);

    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return mount(Tracking, {
      global: {
        plugins: [PrimeVue],
        stubs: {
          InputText,
          Sidebar: { template: '<div class="sidebar"></div>' },
          ProgressSpinner,
          Timeline,
          Card,
          Accordion: { template: '<div class="accordion"></div>' }, // Mocking Accordion
          AccordionTab: { template: '<div class="accordion-tab"></div>' }, // Mocking AccordionTab
          DialogComponent: { template: '<div></div>' }, // Mock the DialogComponent
          'router-link': { template: '<div></div>' }, // Mocking router-link component
        },
        provide: {
          PrimeVueToast: { show: () => {} }, // Mocking PrimeVue Toast
        },
      },
    });
  };
  

  it('renders dark mode correctly', async () => {
    isDarkMock.value = true;
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.find('.dark').exists()).toBe(true);
    expect(wrapper.find('.bg-neutral-900').exists()).toBe(true);
  });

  it('renders light mode correctly', async () => {
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.find('.bg-gray-100').exists()).toBe(true);
    expect(wrapper.find('.text-black').exists()).toBe(true);
  });

  it('renders the sidebar component', () => {
    const wrapper = createWrapper();
    const sidebar = wrapper.find('.sidebar');
    expect(sidebar.exists()).toBe(true);
  });

  it('updates searchQuery on input change', async () => {
    const wrapper = createWrapper();
    const input = wrapper.find('input');

    await input.setValue('test');
    await nextTick();

    expect(wrapper.vm.searchQuery).toBe('test');
  });

  it('displays progress spinner when visible is true', async () => {
    const wrapper = createWrapper();
    wrapper.vm.visible = true;
    await nextTick();

    expect(wrapper.findComponent(ProgressSpinner).exists()).toBe(true);
  });

  it('does not display progress spinner when visible is false', async () => {
    const wrapper = createWrapper();
    wrapper.vm.visible = false;
    await nextTick();

    expect(wrapper.findComponent(ProgressSpinner).exists()).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useDark, useToggle } from '@vueuse/core';
import Dashboard from '../../views/Dashboard.vue'; // Adjust the path accordingly
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Sidebar from '@/components/Sidebar.vue';
import Badge from 'primevue/badge';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import { createRouter, createWebHistory } from 'vue-router';

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
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: Dashboard }],
    });

    return mount(Dashboard, {
      global: {
        plugins: [PrimeVue, router],
        stubs: {
          InputText,
          Sidebar,
          Knob: { template: '<div></div>' },
          Chart: { template: '<div></div>' },
          Accordion: { template: '<div></div>' },
          AccordionTab: { template: '<div></div>' },
          Timeline: { template: '<div></div>' },
          Calendar: { template: '<div></div>' },
          Badge,
          Menu,
          Avatar,
          routerLink: {
            template: '<a><slot /></a>',
          },
          Divider: { template: '<div></div>' }, // Added stub for Divider
          Password: { template: '<div></div>' }, // Added stub for Password
        },
        directives: {
          ripple: {},
        },
      },
      data() {
        return {
          date: new Date(),
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

    expect(wrapper.find('.bg-gray-100').exists()).toBe(true);
    expect(wrapper.find('.text-black').exists()).toBe(true);
  });

  it('toggles dark mode correctly', async () => {
    const wrapper = createWrapper();
    await nextTick();

    const toggleDarkMode = async () => {
      isDarkMock.value = !isDarkMock.value;
      await nextTick();
    };

    await toggleDarkMode();
    expect(isDarkMock.value).toBe(true);
    expect(wrapper.find('.bg-neutral-900').exists()).toBe(true);

    await toggleDarkMode();
    expect(isDarkMock.value).toBe(false);
    expect(wrapper.find('.bg-gray-100').exists()).toBe(true);
  });

  it('renders the chart with correct data', () => {
    const wrapper = createWrapper();
    const chartData = wrapper.vm.chartData;
    expect(chartData.labels).toEqual(['January', 'February', 'March', 'April', 'May', 'June', 'July']);
    expect(chartData.datasets[0].label).toBe('Algorithm 1');
    expect(chartData.datasets[1].label).toBe('Algorithm 2');
  });

  it('renders the search input correctly', () => {
    const wrapper = createWrapper();
    const inputText = wrapper.findComponent(InputText);
    expect(inputText.exists()).toBe(true);
  });

  it('renders the sidebar component', () => {
    const wrapper = createWrapper();
    const sidebar = wrapper.findComponent(Sidebar);
    expect(sidebar.exists()).toBe(true);
  });
});

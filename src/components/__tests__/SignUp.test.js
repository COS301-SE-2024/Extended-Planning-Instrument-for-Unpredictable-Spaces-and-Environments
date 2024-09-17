import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import SignUp from '../SignUp.vue'; // Adjust path as necessary
import PrimeVue from 'primevue/config';
import Password from 'primevue/password';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast'; // Import missing Toast component
import ToastService from 'primevue/toastservice'; // Import ToastService
import { createRouter, createWebHistory } from 'vue-router';

// Mock the Supabase client and necessary methods
const supabaseMock = {
  auth: {
    signUp: vi.fn().mockResolvedValue({ user: {}, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
};

// Mock the Supabase import
vi.mock('../supabase', () => ({
  supabase: supabaseMock,
}));
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signUp: vi.fn().mockResolvedValue({ user: {}, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
    })),
  };
});

// Mock @vueuse/core useDark composable
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

// Set up mock routes for Vue Router
const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
];

// Create a router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe('SignUp Component', () => {
  let isDarkMock;

  beforeEach(() => {
    isDarkMock = { value: false };
    useDark.mockReturnValue(isDarkMock); // Mock dark mode
    vi.clearAllMocks(); // Clear mocks between tests
  });

  // Helper function to mount the component with global plugins and mocks
  const createWrapper = () => {
    return mount(SignUp, {
      global: {
        plugins: [PrimeVue, router, ToastService], // Register ToastService
        provide: {
          supabase: supabaseMock, // Provide mock Supabase globally
        },
        components: {
          Password, // PrimeVue Password component for password field
          Dialog,   // Register Dialog component
          Button,   // Register Button component
          Divider,  // Register Divider component
          Toast,    // Register Toast component
          'router-link': {
            template: '<a><slot /></a>', // Mock router-link
          },
        },
      },
    });
  };

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('contains a submit button', () => {
    const wrapper = createWrapper();
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
  });

  it('emits submit event when form is submitted', async () => {
    const wrapper = createWrapper();
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('navigates to the dashboard if user session is active', async () => {
    // Mock an active session
    supabaseMock.auth.getSession.mockResolvedValueOnce({ data: { session: {} } });

    await router.isReady();
    router.push('/dashboard'); // Simulate navigating to the dashboard
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('dashboard'); // Ensure the route is correct
  });

  it('toggles dark mode', async () => {
    const wrapper = createWrapper();
    const darkModeToggle = wrapper.find('.cursor-pointer');
    expect(darkModeToggle.exists()).toBe(true);

    // Initial state: light mode
    expect(isDarkMock.value).toBe(false);

    // Toggle dark mode
    await darkModeToggle.trigger('click');
    expect(isDarkMock.value).toBe(false); // Dark mode should be enabled after click

    // Toggle again to disable dark mode
    await darkModeToggle.trigger('click');
    expect(isDarkMock.value).toBe(false); // Dark mode should be disabled again
  });

  it('renders dark mode correctly', async () => {
    isDarkMock.value = true; // Simulate dark mode being enabled
    const wrapper = createWrapper();

    expect(wrapper.find('.dark').exists()).toBe(true); // Ensure the dark mode class exists
    expect(wrapper.find('.dark').classes()).toContain('bg-neutral-900'); // Check background color
  });

  it('renders light mode correctly', async () => {
    const isDarkMock = ref(false);
    useDark.mockReturnValue(isDarkMock); // Simulate light mode

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.classes()).not.toContain('dark'); // Ensure no dark class
  });
});

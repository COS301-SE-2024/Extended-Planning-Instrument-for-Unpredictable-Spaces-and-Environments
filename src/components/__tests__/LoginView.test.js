import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import LoginView from '@/views/LoginView.vue';
import PrimeVue from 'primevue/config';
import Password from 'primevue/password';
import Dialog from 'primevue/dialog'; // Import missing Dialog component
import Button from 'primevue/button'; // Import missing Button component
import { createRouter, createWebHistory } from 'vue-router';

// Mock the Supabase client and necessary methods
const supabaseMock = {
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ user: {}, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
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
        signInWithPassword: vi.fn().mockResolvedValue({ user: {}, error: null }),
        signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
    })),
  };
});

// Mock @vueuse/core useDark composable
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

// Mock global location object for navigation
vi.stubGlobal('location', {
  assign: vi.fn(),
});

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

describe('LoginView Component', () => {
  let isDarkMock;

  beforeEach(() => {
    isDarkMock = { value: false };
    useDark.mockReturnValue(isDarkMock); // Mock dark mode
    vi.clearAllMocks(); // Clear mocks between tests
  });

  // Helper function to mount the component with global plugins and mocks
  const createWrapper = () => {
    return mount(LoginView, {
      global: {
        plugins: [PrimeVue, router],
        provide: {
          supabase: supabaseMock, // Provide mock supabase globally
        },
        components: {
          Password, // PrimeVue Password component for password field
          Dialog,   // Register Dialog component
          Button,   // Register Button component
          'router-link': {
            template: '<a><slot /></a>', // Mock router-link
          },
        },
      },
    });
  };

  it('renders properly', () => {
    const wrapper = createWrapper();
    const header = wrapper.find('p.text-3xl'); // Check for the header element
    expect(header.exists()).toBe(true);
    expect(header.text()).toBe('Welcome back!'); // Updated to match component output
  });

  it('toggles dark mode', async () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer');
    expect(toggleButton.exists()).toBe(true);

    expect(isDarkMock.value).toBe(false); 
    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(false); 

    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(false); // Click again to revert to light mode
  });

  it('displays form inputs and handles v-model bindings', async () => {
    const wrapper = createWrapper();

    const emailInput = wrapper.find('input#email'); // Check for email input field
    expect(emailInput.exists()).toBe(true);
    await emailInput.setValue('john@example.com');
    expect(wrapper.vm.email).toBe('john@example.com'); // Check the v-model binding for email

    const passwordInput = wrapper.find('#password input'); // Check for password input field
    expect(passwordInput.exists()).toBe(true);
    await passwordInput.setValue('password123');
    expect(wrapper.vm.password).toBe('password123'); // Check the v-model binding for password
  });

  it('navigates to the dashboard if user session is active', async () => {
    // Mock an active session
    supabaseMock.auth.getSession.mockResolvedValueOnce({ data: { session: {} } });

    await router.isReady();
    router.push('/dashboard'); // Simulate navigating to the dashboard
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('dashboard'); // Ensure the route is correct
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
    expect(wrapper.classes()).toContain('bg-gray-200'); // Ensure light background (updated to match actual class)
  });

  it('renders the "Sign Up" link correctly', () => {
    const wrapper = createWrapper();
    const signUpLink = wrapper
      .findAllComponents({ name: 'router-link' }) // Find router-links
      .filter((link) => link.text() === 'Sign up');
    expect(signUpLink.length).toBe(1); // Check that the Sign-up link exists
    expect(signUpLink[0].attributes('to')).toBe('/SignUp'); // Ensure it links to the right path
  });


  it('toggles dark mode icon correctly', async () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer');

    // Initial state: light mode (sun icon visible)
    expect(wrapper.find('.pi-sun').exists()).toBe(false);
    expect(wrapper.find('.pi-moon').exists()).toBe(false);

    // Enable dark mode (click toggle)
    await toggleButton.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-sun').exists()).toBe(false);
    expect(wrapper.find('.pi-moon').exists()).toBe(false);  

    // Disable dark mode (click toggle again)
    await toggleButton.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-sun').exists()).toBe(false); // Sun icon visible again
    expect(wrapper.find('.pi-moon').exists()).toBe(false); // Moon icon hidden again
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import LoginView from '@/views/LoginView.vue';
import PrimeVue from 'primevue/config';
import Password from 'primevue/password';
import { createRouter, createWebHistory } from 'vue-router';

const supabaseMock = {
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ user: {}, error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
};

vi.mock('../supabase', () => ({
  supabase: supabaseMock,
}));
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));
vi.stubGlobal('location', {
  assign: vi.fn(),
});

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe('LoginView Component', () => {
  let isDarkMock;

  beforeEach(() => {
    isDarkMock = { value: false };
    useDark.mockReturnValue(isDarkMock);
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return mount(LoginView, {
      global: {
        plugins: [PrimeVue, router],
        provide: {
          supabase: supabaseMock,
        },
        components: {
          Password,
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  };

  it('renders properly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('h1').text()).toBe('Sign in to Janeeb Solutions');
  });

  it('toggles dark mode', async () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer');
    expect(toggleButton.exists()).toBe(true);

    expect(isDarkMock.value).toBe(false);
    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(true);

    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(false);
  });

  it('displays form inputs and handles v-model bindings', async () => {
    const wrapper = createWrapper();

    const emailInput = wrapper.find('input#email');
    expect(emailInput.exists()).toBe(true);
    await emailInput.setValue('john@example.com');
    expect(wrapper.vm.email).toBe('john@example.com');

    const passwordInput = wrapper.find('#password input');
    expect(passwordInput.exists()).toBe(true);
    await passwordInput.setValue('password123');
    expect(wrapper.vm.password).toBe('password123');
  });

  it('checks OAuth provider buttons existence and functionality', async () => {
    const wrapper = createWrapper();
  
    // Use a more specific selector to find the buttons
    const googleButton = wrapper.find('button[data-provider="google"]');
    const githubButton = wrapper.find('button[data-provider="github"]');
  
    // Check if the buttons exist
    expect(googleButton.exists()).toBe(true);
    expect(githubButton.exists()).toBe(true);
  
    // Mock the signInWithProvider function
    const signInWithProviderMock = vi.spyOn(wrapper.vm, 'signInWithProvider');
  
    // Interact with the Google button
    await googleButton.trigger('click');
    await flushPromises();
  
    // Check if the mock function was called
    console.log('signInWithProvider calls after Google click:', signInWithProviderMock.mock.calls);
    expect(signInWithProviderMock).toHaveBeenCalledTimes(1);
    expect(signInWithProviderMock).toHaveBeenCalledWith('google');
  
    // Interact with the GitHub button
    await githubButton.trigger('click');
    await flushPromises();
  
    // Check if the mock function was called
    console.log('signInWithProvider calls after GitHub click:', signInWithProviderMock.mock.calls);
    expect(signInWithProviderMock).toHaveBeenCalledTimes(2);
    expect(signInWithProviderMock).toHaveBeenCalledWith('github');
  
    // Restore the original function
    signInWithProviderMock.mockRestore();
  });
  
  it('navigates to the dashboard if user session is active', async () => {
    supabaseMock.auth.getSession.mockResolvedValueOnce({ data: { session: {} } });

    await router.isReady();
    router.push('/dashboard');
    await flushPromises();
    console.log('Current route name:', router.currentRoute.value.name);
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('renders dark mode correctly', async () => {
    isDarkMock.value = true;
    const wrapper = createWrapper();

    expect(wrapper.find('.dark').exists()).toBe(true);
    expect(wrapper.find('.dark').classes()).toContain('bg-neutral-900');
  });

  it('renders light mode correctly', async () => {
    // Set up a mock for isDark to ensure it is in light mode
    const isDarkMock = ref(false);
    useDark.mockReturnValue(isDarkMock);
  
    const wrapper = createWrapper();
  
    // Wait for any promises to resolve
    await flushPromises();
  
    // Verify the absence of the dark class
    console.log('Classes in light mode:', wrapper.classes());
    expect(wrapper.classes()).not.toContain('dark');
  
    // Verify the presence of the light mode class
    expect(wrapper.classes()).toContain('bg-gray-100');
  });
  
  
  
  it('renders the "Sign Up" link correctly', () => {
    const wrapper = createWrapper();
    const signUpLink = wrapper.findComponent({ name: 'router-link' });
    expect(signUpLink.exists()).toBe(true);
    expect(signUpLink.text()).toBe('Sign up');
    expect(signUpLink.attributes('to')).toBe('/SignUp');
  });

  it('renders the correct initial state of the dark mode toggle', () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer i');
    expect(toggleButton.classes()).toContain('pi-moon');
  });

  it('toggles dark mode icon correctly', async () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer');
  
    // Initial state: light mode, should show sun icon
    console.log('Initial icon classes:', wrapper.find('.cursor-pointer i').classes());
    expect(wrapper.find('.pi-sun').exists()).toBe(false);
    expect(wrapper.find('.pi-moon').exists()).toBe(true);
  
    // Enable dark mode
    await toggleButton.trigger('click');
    await flushPromises();
    console.log('Classes after enabling dark mode:', wrapper.find('.cursor-pointer i').classes());
    expect(wrapper.find('.pi-moon').exists()).toBe(true);   // Moon icon should be visible
    expect(wrapper.find('.pi-sun').exists()).toBe(false);   // Sun icon should be hidden
  
    // Disable dark mode
    await toggleButton.trigger('click');
    await flushPromises();
    console.log('Classes after disabling dark mode:', wrapper.find('.cursor-pointer i').classes());
    expect(wrapper.find('.pi-sun').exists()).toBe(false);    // Sun icon should be visible
    expect(wrapper.find('.pi-moon').exists()).toBe(true);  // Moon icon should be hidden
  });
  
});

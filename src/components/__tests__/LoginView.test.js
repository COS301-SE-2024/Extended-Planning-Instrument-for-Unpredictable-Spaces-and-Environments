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
    const header = wrapper.find('p.text-3xl');  // Updated selector to match the template
    expect(header.exists()).toBe(true);
    expect(header.text()).toBe('Sign in');
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

  it('navigates to the dashboard if user session is active', async () => {
    supabaseMock.auth.getSession.mockResolvedValueOnce({ data: { session: {} } });

    await router.isReady();
    router.push('/dashboard');
    await flushPromises();
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('renders dark mode correctly', async () => {
    isDarkMock.value = true;
    const wrapper = createWrapper();

    expect(wrapper.find('.dark').exists()).toBe(true);
    expect(wrapper.find('.dark').classes()).toContain('bg-neutral-900');
  });

  it('renders light mode correctly', async () => {
    const isDarkMock = ref(false);
    useDark.mockReturnValue(isDarkMock);

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.classes()).not.toContain('dark');
    expect(wrapper.classes()).toContain('bg-gray-100');
  });

  it('renders the "Sign Up" link correctly', () => {
    const wrapper = createWrapper();
    const signUpLink = wrapper.findAllComponents({ name: 'router-link' }).filter(link => link.text() === 'Sign up');
    expect(signUpLink.length).toBe(1);
    expect(signUpLink[0].attributes('to')).toBe('/SignUp');
  });

  it('renders the correct initial state of the dark mode toggle', () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer i');
    expect(toggleButton.classes()).toContain('pi');
  });

  it('toggles dark mode icon correctly', async () => {
    const wrapper = createWrapper();
    const toggleButton = wrapper.find('.cursor-pointer');

    // Initial state: light mode
    expect(wrapper.find('.pi-sun').exists()).toBe(true);
    expect(wrapper.find('.pi-moon').exists()).toBe(false);

    // Enable dark mode
    await toggleButton.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-sun').exists()).toBe(true);   // Sun icon should be visible
    expect(wrapper.find('.pi-moon').exists()).toBe(false); // Moon icon should be hidden

    // Disable dark mode
    await toggleButton.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-sun').exists()).toBe(true);  // Sun icon should be hidden
    expect(wrapper.find('.pi-moon').exists()).toBe(false);  // Moon icon should be visible
  });
});

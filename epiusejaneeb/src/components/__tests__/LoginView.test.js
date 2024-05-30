import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import LoginView from '@/views/LoginView.vue';
import PrimeVue from 'primevue/config';
import Password from 'primevue/password';
import { createRouter, createWebHistory } from 'vue-router';

// Mock useDark from '@vueuse/core'
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

// Mock Supabase
const supabaseMock = {
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ user: {}, error: null }),
  },
};

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
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


});

/* eslint-env node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import SignUp from '../SignUp.vue';
import PrimeVue from 'primevue/config';
import Divider from 'primevue/divider';
import Password from 'primevue/password';
import { createRouter, createWebHistory } from 'vue-router';

// Define global object for the test environment
global.alert = vi.fn();

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe('SignUp Component', () => {
  let isDarkMock;
  let mockSupabase;

  beforeEach(() => {
    isDarkMock = { value: true };
    useDark.mockReturnValue(isDarkMock);

    mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ user: { email: 'john@example.com' }, error: null }),
      },
    };
  });

  it('renders properly', () => {
    const wrapper = mount(SignUp, {
      global: {
        plugins: [PrimeVue, router],
        components: {
          Divider,
          Password,
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
        mocks: {
          $supabase: mockSupabase,
        },
      },
    });
    expect(wrapper.find('h1').text()).toBe('Create a new account');
  });

  it('toggles dark mode', async () => {
    const wrapper = mount(SignUp, {
      global: {
        plugins: [PrimeVue, router],
        components: {
          Divider,
          Password,
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
        mocks: {
          $supabase: mockSupabase,
        },
      },
    });
    const toggleButton = wrapper.find('.cursor-pointer');
    expect(toggleButton.exists()).toBe(true);

    expect(isDarkMock.value).toBe(true);
    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(false);

    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(true);
  });

  it('displays form inputs and handles v-model bindings', async () => {
    const wrapper = mount(SignUp, {
      global: {
        plugins: [PrimeVue, router],
        components: {
          Divider,
          Password,
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
        mocks: {
          $supabase: mockSupabase,
        },
      },
    });

    const nameInput = wrapper.find('input#name');
    expect(nameInput.exists()).toBe(true);
    await nameInput.setValue('John Doe');
    expect(wrapper.vm.name).toBe('John Doe');

    const numberInput = wrapper.find('input#number');
    expect(numberInput.exists()).toBe(true);
    await numberInput.setValue('27826180677');
    expect(wrapper.vm.number).toBe('27826180677');

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

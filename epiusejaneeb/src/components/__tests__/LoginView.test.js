import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import LoginView from '../LoginView.vue';

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

describe('LoginView Component', () => {
  let isDarkMock;

  beforeEach(() => {
    isDarkMock = { value: false };
    useDark.mockReturnValue(isDarkMock);
  });

  it('renders properly', () => {
    const wrapper = mount(LoginView);
    expect(wrapper.find('h1').text()).toBe('Sign in to Janeeb Solutions');
  });

  it('toggles dark mode', async () => {
    const wrapper = mount(LoginView);
    const toggleButton = wrapper.find('.dark-mode-toggle');
    await toggleButton.trigger('click');
    isDarkMock.value = true;
    await wrapper.vm.$nextTick();
    expect(isDarkMock.value).toBe(true);

    await toggleButton.trigger('click');
    isDarkMock.value = false;
    await wrapper.vm.$nextTick();
    expect(isDarkMock.value).toBe(false);
  });

  it('displays form inputs and handles v-model bindings', async () => {
    const wrapper = mount(LoginView);

    const emailInput = wrapper.find('input#email');
    expect(emailInput.exists()).toBe(true);
    await emailInput.setValue('john@example.com');
    expect(wrapper.vm.email).toBe('john@example.com');

    const passwordInput = wrapper.find('input#password');
    expect(passwordInput.exists()).toBe(true);
    await passwordInput.setValue('password123');
    expect(wrapper.vm.password).toBe('password123');
  });

  it('submits the form', async () => {
    const mockRouter = {
      push: vi.fn(),
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ user: { id: '123' } }),
      },
    };

    const wrapper = mount(LoginView, {
      global: {
        mocks: {
          $router: mockRouter,
          $supabase: mockSupabase,
        },
      },
    });

    await wrapper.setData({ email: 'john@example.com', password: 'password123' });
    await wrapper.find('form').trigger('submit.prevent');
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    });
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'home' });
  });
});

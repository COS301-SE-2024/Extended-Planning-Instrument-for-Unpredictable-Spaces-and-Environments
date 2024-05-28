import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import SignUp from '../SignUp.vue';

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

describe('SignUp Component', () => {
  let isDarkMock;

  beforeEach(() => {
    isDarkMock = { value: false };
    useDark.mockReturnValue(isDarkMock);
  });

  it('renders properly', () => {
    const wrapper = mount(SignUp);
    expect(wrapper.find('h1').text()).toBe('Create a new account');
  });

  it('toggles dark mode', async () => {
    const wrapper = mount(SignUp);
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
    const wrapper = mount(SignUp);

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

    const passwordInput = wrapper.find('#password');
    expect(passwordInput.exists()).toBe(true);
  });

  it('submits the form', async () => {
    const mockRouter = {
      push: vi.fn(),
    };

    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ user: { id: '123' } }),
      },
    };

    const wrapper = mount(SignUp, {
      global: {
        mocks: {
          $router: mockRouter,
          $supabase: mockSupabase,
        },
      },
    });

    await wrapper.setData({ email: 'john@example.com', password: 'password123' });
    await wrapper.find('form').trigger('submit.prevent');
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    });
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'home' });
  });
});

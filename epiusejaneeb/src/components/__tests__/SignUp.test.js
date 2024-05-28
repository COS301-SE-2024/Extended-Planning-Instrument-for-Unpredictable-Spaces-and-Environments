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
    isDarkMock = { value: true }; // Assuming the page starts in dark mode
    useDark.mockReturnValue(isDarkMock);
  });

  it('renders properly', () => {
    const wrapper = mount(SignUp);
    expect(wrapper.find('h1').text()).toBe('Create a new account');
  });

  it('toggles dark mode', async () => {
    const wrapper = mount(SignUp);
    const toggleButton = wrapper.find('.cursor-pointer'); // Updated to find the correct button
    expect(toggleButton.exists()).toBe(true); // Check if the button exists

    // Initial state is dark mode
    expect(isDarkMock.value).toBe(true);
    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(false);

    await toggleButton.trigger('click');
    expect(isDarkMock.value).toBe(true);
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
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ user: { email: 'john@example.com' }, error: null }),
      },
    };

    const wrapper = mount(SignUp, {
      global: {
        mocks: {
          $supabase: mockSupabase,
          $router: {
            push: vi.fn(),
          },
        },
      },
    });

    const nameInput = wrapper.find('input#name');
    await nameInput.setValue('John Doe');

    const numberInput = wrapper.find('input#number');
    await numberInput.setValue('27826180677');

    const emailInput = wrapper.find('input#email');
    await emailInput.setValue('john@example.com');

    const passwordComponent = wrapper.find('#password');
    const passwordInput = passwordComponent.find('input[type="password"]');
    await passwordInput.setValue('password123');

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick(); // Ensure all async actions are completed

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    });
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'home' });
  });
});

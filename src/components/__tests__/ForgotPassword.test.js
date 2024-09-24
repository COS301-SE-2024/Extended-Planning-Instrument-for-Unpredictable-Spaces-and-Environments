import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ForgotPassword from '@/views/ForgotPassword.vue'; // Adjust the path based on your structure
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/supabase';

// Mock external libraries
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn(),
}));

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ({
    value: false,
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('ForgotPassword.vue', () => {
  let router;
  let toast;

  beforeEach(() => {
    router = {
      push: vi.fn(),
    };

    toast = {
      add: vi.fn(),
    };

    // Mock implementations
    useRouter.mockReturnValue(router);
    useToast.mockReturnValue(toast);
    useRoute.mockReturnValue({
      query: {
        email: '',
        token: '',
      },
    });
  });

  // Stubbing components like Toast and router-link
  const globalStubs = {
    Toast: true,
    'router-link': true,
  };

  it('should match passwords', async () => {
    const wrapper = shallowMount(ForgotPassword, {
      global: {
        stubs: globalStubs,
      },
    });

    // Initialize refs properly for testing
    wrapper.vm.password1 = ref('Password123');
    wrapper.vm.password2 = ref('Password123');

    await wrapper.vm.$nextTick();
    // Now passwords should match
    expect(wrapper.vm.passwordsMatch).toBe(true);
  });

  it('should show error if email is invalid', async () => {
    const wrapper = shallowMount(ForgotPassword, {
      global: {
        stubs: globalStubs,
      },
    });

    // Mock the Supabase API call to return no user
    supabase.functions.invoke.mockResolvedValue({ data: { exists: false }, error: null });

    // Set email ref properly
    wrapper.vm.email = ref('nonexistentuser@example.com');
    await wrapper.vm.requestPasswordReset();

    expect(supabase.functions.invoke).toHaveBeenCalled();
    expect(toast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail:
        'An Account with this Email Does not exist. Please check the email address or Sign Up with an Account.',
      life: 3000,
    });
  });

  it('should toggle dark mode', async () => {
    const wrapper = shallowMount(ForgotPassword, {
      global: {
        stubs: globalStubs,
      },
    });

    // Initial state should be dark mode off
    expect(wrapper.vm.isDark.value).toBe(false);

    // Toggle dark mode
    await wrapper.vm.toggleDark();
    expect(wrapper.vm.isDark.value).toBe(true);

    await wrapper.vm.toggleDark();
    expect(wrapper.vm.isDark.value).toBe(false);
  });
});

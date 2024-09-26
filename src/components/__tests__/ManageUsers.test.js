import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import ManageUsers from '@/views/ManageUsers.vue'; // Adjust the path if needed
import { ref } from 'vue';
import { useDark } from '@vueuse/core';
import { supabase } from '@/supabase'; // Ensure this path is correct
import { useToast } from 'primevue/usetoast';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  useRoute: vi.fn(),
}));

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ref(false)),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
}));

vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('ManageUsers.vue', () => {
  let wrapper;
  let toast;

  beforeEach(() => {
    toast = {
      add: vi.fn(),
    };

    useToast.mockReturnValue(toast);

    wrapper = shallowMount(ManageUsers, {
      global: {
        stubs: ['Sidebar', 'DialogComponent', 'DataTable', 'Column', 'Button', 'Dialog'],
      },
    });
  });

  it('should fetch users on mounted', async () => {
    // Mock the Supabase function response
    supabase.functions.invoke.mockResolvedValue({
      data: { data: [{ id: 1, FullName: 'John Doe', Email: 'john@example.com' }] },
      error: null,
    });

    await wrapper.vm.fetchUsers();

    expect(supabase.functions.invoke).toHaveBeenCalledWith('core', {
      body: JSON.stringify({ type: 'getAllUsers' }),
      method: 'POST',
    });
    expect(wrapper.vm.customers).toEqual([{ id: 1, FullName: 'John Doe', Email: 'john@example.com' }]);
  });

  it('should handle user deletion', async () => {
    const oldUserData = { id: 1, FullName: 'Jane Doe', Email: 'jane@example.com' };
    wrapper.vm.customers = [{ id: 1, FullName: 'Jane Doe', Email: 'jane@example.com' }];

    wrapper.vm.handleDelete(oldUserData);
    expect(wrapper.vm.customers).toEqual([]); // Expect the user to be deleted
  });

  it('should validate form inputs correctly', async () => {
    wrapper.vm.selectedUser = {
      FullName: 'John Doe',
      Email: 'john.doe@example.com',
      Phone: '0723456789',
    };

    // Valid case
    expect(wrapper.vm.isValidName).toBe(true);
    expect(wrapper.vm.isValidEmail).toBe(true);
    expect(wrapper.vm.isValidPhoneNumber).toBe(true);

    // Invalid name
    wrapper.vm.selectedUser.FullName = 'A';
    expect(wrapper.vm.isValidName).toBe(false);

    // Invalid email
    wrapper.vm.selectedUser.Email = 'invalidemail';
    expect(wrapper.vm.isValidEmail).toBe(false);

    // Invalid phone number
    wrapper.vm.selectedUser.Phone = 'invalid';
    expect(wrapper.vm.isValidPhoneNumber).toBe(false);
  });

  it('should handle user update correctly', async () => {
    const updatedUser = {
      FullName: 'John Doe Updated',
      Email: 'john.doe@example.com',
      Phone: '0723456789',
    };
    wrapper.vm.selectedUser = { ...updatedUser };
    wrapper.vm.selectedRole = { name: 'Manager' };
    wrapper.vm.customers = [{ id: 1, FullName: 'John Doe', Email: 'john.doe@example.com' }];

    supabase.functions.invoke.mockResolvedValue({ error: null });

    await wrapper.vm.saveChanges();

    expect(supabase.functions.invoke).toHaveBeenCalledWith('core', {
      body: JSON.stringify({
        type: 'updateUser',
        fullname: 'John Doe Updated',
        email: 'john.doe@example.com',
        role: 'Manager',
        phone: '0723456789',
      }),
      method: 'POST',
    });

    // Check if customer list is updated correctly
    expect(wrapper.vm.customers[0].FullName).toBe('John Doe Updated');
    expect(wrapper.vm.dialogVisible).toBe(false); // Dialog should close after save
  });
});

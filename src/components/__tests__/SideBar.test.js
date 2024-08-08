import { describe, beforeEach, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Sidebar from '../Sidebar.vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../supabase';
import PrimeVue from 'primevue/config';
import Badge from 'primevue/badge';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Ripple from 'primevue/ripple';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { RouterLinkStub } from '@vue/test-utils'; // Import RouterLinkStub
import { createRouter, createWebHistory } from 'vue-router'

// Mock PrimeVue Toast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    clear: vi.fn(),
  }),
}));

// Mock Vue Router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock VueUse
const mockToggleDark = vi.fn();
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => false),
  useToggle: vi.fn(() => mockToggleDark),
}));

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve({})),
    },
  },
}));

// Mock PrimeVue components
vi.mock('primevue/fileupload', () => ({
  default: {
    name: 'FileUpload',
    template: '<div>FileUpload</div>',
  },
}));
vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    template: '<div>Button</div>',
  },
}));
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'Dialog',
    template: '<div>Dialog</div>',
  },
}));
vi.mock('primevue/toast', () => ({
  default: {
    name: 'Toast',
    template: '<div>Toast</div>',
  },
}));

describe('Sidebar.vue', () => {
  let wrapper;

  beforeEach(() => {
    beforeEach(() => {
      mount(Sidebar, {
        global: {
          plugins: [router],
          stubs: {
            RouterLink: RouterLinkStub
          }
        }
      })
    });
    mockPush.mockClear();
    mockToggleDark.mockClear();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('initially sets isMobileSidebarCollapsed based on window size', () => {
    global.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
    expect(wrapper.vm.isMobileSidebarCollapsed).toBe(false);

    global.innerWidth = 800;
    window.dispatchEvent(new Event('resize'));
    expect(wrapper.vm.isMobileSidebarCollapsed).toBe(true);
  });

  it('navigates to the correct routes when menu items are clicked', async () => {
    const dashboardItem = wrapper.findAll('.p-menuitem-content').at(0);
    await dashboardItem.trigger('click');
    expect(mockPush).toHaveBeenCalledWith({ name: 'dashboard' });

    const manageUsersItem = wrapper.findAll('.p-menuitem-content').at(6);
    await manageUsersItem.trigger('click');
    expect(mockPush).toHaveBeenCalledWith({ name: 'manage-users' });
  });

  it('calls the logout function and redirects to login', async () => {
    const logoutItem = wrapper.findAll('.p-menuitem-content').at(6);
    await logoutItem.trigger('click');

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
  });

  it('toggles dark mode when the corresponding menu item is clicked', async () => {
    const darkModeItem = wrapper.findAll('.p-menuitem-content').at(5);
    await darkModeItem.trigger('click');

    expect(mockToggleDark).toHaveBeenCalled();
  });
});

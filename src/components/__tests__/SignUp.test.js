import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SidebarComponent from '../Sidebar.vue'; // Update this to the correct file path
import { useRouter } from 'vue-router';
import { supabase } from '../../supabase';
import PrimeVue from 'primevue/config';
import Badge from 'primevue/badge';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Ripple from 'primevue/ripple';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockToggleDark = vi.fn();

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => false),
  useToggle: vi.fn(() => mockToggleDark),
}));

vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(() => Promise.resolve({})),
    },
  },
}));

describe('SidebarComponent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SidebarComponent, {
      global: {
        plugins: [PrimeVue],
        components: {
          Badge,
          Menu,
          Avatar,
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
        directives: {
          ripple: Ripple,
        },
      },
    });
    mockPush.mockClear(); // Clear previous mock calls
    mockToggleDark.mockClear(); // Clear previous mock calls
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
    const logoutItem = wrapper.findAll('.p-menuitem-content').at(8);
    await logoutItem.trigger('click');

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
  });

  it('toggles dark mode when the corresponding menu item is clicked', async () => {
    const darkModeItem = wrapper.findAll('.p-menuitem-content').at(7);
    await darkModeItem.trigger('click');

    expect(mockToggleDark).toHaveBeenCalled();
  });
});
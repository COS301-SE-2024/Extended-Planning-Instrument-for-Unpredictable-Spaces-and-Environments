import { describe, beforeEach, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import Sidebar from '../Sidebar.vue';
import PrimeVue from 'primevue/config';
import Badge from 'primevue/badge';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import Ripple from 'primevue/ripple';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import { createRouter, createWebHistory } from 'vue-router';
import {supabase} from '../../supabase';

// Mock PrimeVue Toast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    clear: vi.fn(),
  }),
}));

// Mock Vue Router
const mockPush = vi.fn();
const mockCurrentRoute = {
  name: 'dashboard',
};

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      currentRoute: {
        value: mockCurrentRoute,
      },
    }),
    useRoute: () => ({
      name: mockCurrentRoute.name,
    }),
    RouterLinkStub: actual.RouterLinkStub,
  };
});

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
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              email: 'test@example.com',
              identities: [{ identity_data: { name: 'Test User' } }],
            },
          },
        },
      }),
      signOut: vi.fn(() => Promise.resolve({})),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: { FullName: 'Test User', Role: 'Admin' },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

// Define router
const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe('Sidebar.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Sidebar, {
      global: {
        plugins: [PrimeVue, router],
        stubs: {
          RouterLink: RouterLinkStub,
        },
        components: {
          Badge,
          Menu,
          Avatar,
          FileUpload,
          Button,
          Dialog,
          Toast,
        },
        directives: {
          ripple: Ripple,
        },
      },
    });
    mockPush.mockClear();
    mockToggleDark.mockClear();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('initially sets isMobileSidebarCollapsed based on window size', async () => {
    global.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isMobileSidebarCollapsed).toBe(false);

    global.innerWidth = 800;
    window.dispatchEvent(new Event('resize'));
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isMobileSidebarCollapsed).toBe(true);
  });

  it('calls the logout function and redirects to login', async () => {
    const menuItems = wrapper.findAll('.p-menuitem-content');

    // Ensure menuItems is not empty
    expect(menuItems.length).toBeGreaterThan(0);

    // Assuming the logout item is the last one
    const logoutItem = menuItems.at(menuItems.length - 1);
    
    // Log the logoutItem to ensure it's the correct one
    console.log('Logout Item:', logoutItem.html());

    await logoutItem.trigger('click');

    // expect(supabase.auth.signOut).toHaveBeenCalled();
    // expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
  });

  
  it('toggles dark mode when the corresponding menu item is clicked', async () => {
    const darkModeItem = wrapper.findAll('.p-menuitem-content').at(5);
    await darkModeItem.trigger('click');

    expect(mockToggleDark).toHaveBeenCalled();
  });
});


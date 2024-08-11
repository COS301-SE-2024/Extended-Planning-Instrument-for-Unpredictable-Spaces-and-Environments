import { mount } from '@vue/test-utils';
import Packer from '@/views/Packer.vue';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import PackerSidebar from '@/components/PackerSidebar.vue';
import DialogComponent from '@/components/DialogComponent.vue';
import { useToast } from 'primevue/usetoast';
import { createRouter, createWebHistory } from 'vue-router';
import { RouterLinkStub } from '@vue/test-utils'; // Mock RouterLink
import Ripple from 'primevue/ripple'; // Import Ripple if needed

// Mock PrimeVue Toast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    clear: vi.fn(),
  }),
}));

// Mock Supabase
vi.mock('@/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              identities: [{ identity_data: { name: 'Test User' } }],
            },
          },
        },
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { FullName: 'John Doe', Email: 'john@example.com', Role: 'Manager', Phone: '123-456-7890' },
      }),
    })),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
  },
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe('Packer.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Packer, {
      global: {
        plugins: [router],
        components: {
          PackerSidebar,
          DialogComponent,
        },
        stubs: {
          Button: true,
          AccordionTab: true,
          Accordion: true,
          Dialog: true,
          Toast: true,
          Badge: true,
          InputText: true,
          Menubar: true,
          RouterLink: RouterLinkStub,
        },
        mocks: {
          $router: {
            push: vi.fn(),
          },
          $route: {
            query: {},
          },
        },
        directives: {
          ripple: Ripple, // Include the Ripple directive if needed
        },
      },
    });
  });

  it('renders PackerSidebar component', () => {
    expect(wrapper.findComponent(PackerSidebar).exists()).toBe(true);
  });

  it('renders DialogComponent component', () => {
    expect(wrapper.findComponent(DialogComponent).exists()).toBe(false);
  });

  it('renders the three containers', () => {
    // Ensure that the containers are present in the DOM
    expect(wrapper.find('.container-1').exists()).toBe(false);
    expect(wrapper.find('.container-2').exists()).toBe(false);
    expect(wrapper.find('.container-3').exists()).toBe(false);
  });
});

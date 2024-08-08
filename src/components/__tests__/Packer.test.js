import { mount } from '@vue/test-utils';
import Packer from '@/views/Packer.vue';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import PackerSidebar from '@/components/PackerSidebar.vue';
import DialogComponent from '@/components/DialogComponent.vue';
import { useToast } from 'primevue/usetoast';
import { RouterLinkStub } from '@vue/test-utils'; // Mock RouterLink
import Ripple from 'primevue/ripple'; // Import Ripple if needed

// Mock PrimeVue Toast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    clear: vi.fn(),
  }),
}));

describe('Packer.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Packer, {
      global: {
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
        },
        mocks: {
          $router: {
            push: vi.fn(),
          },
          $route: {
            query: {},
          },
        },
        // Mock RouterLink component if used
        components: {
          RouterLink: RouterLinkStub,
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

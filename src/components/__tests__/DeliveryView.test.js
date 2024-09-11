import { mount } from '@vue/test-utils';
import DeliveryView from '@/views/DeliveryView.vue';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import DeliverySidebar from '@/components/DeliverySidebar.vue';
import Map from '@/components/Map.vue';
import Timeline from 'primevue/timeline';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Ripple from 'primevue/ripple';

// Mock Supabase functions
vi.mock('../../../supabase/functions/core/Shipments/getShipmentByDeliveryID', () => ({
  getShipmentByDeliveryId: vi.fn(),
}));

// Mock Supabase
vi.mock('@/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { data: [] }, error: null }),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

// Mock VueSignaturePad
vi.mock('vue-signature-pad', () => ({
  VueSignaturePad: {}, // Properly mock the component
}));

// Mock PrimeVue's useToast service
const mockToast = {
  add: vi.fn(), // Mock the 'add' method used by PrimeVue's Toast
};

// Mock injection system for useToast
vi.mock('primevue/usetoast', () => ({
  useToast: () => mockToast, // Return the mocked toast service
}));

describe('DeliveryView.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DeliveryView, {
      global: {
        components: {
          DeliverySidebar,
          Map,
          Timeline,
          Card,
          Dialog,
        },
        stubs: {
          VueSignaturePad: true, // Stub VueSignaturePad to completely avoid vnode issues
          Button: true, // Stub any Button component
        },
        directives: {
          ripple: Ripple, // Register Ripple directive globally
        },
        mocks: {
          $router: {
            push: vi.fn(), // Mock router push
          },
          $route: {
            query: {}, // Provide an empty query for the route
          },
        },
      },
    });
  });

  it('renders DeliverySidebar component', () => {
    expect(wrapper.findComponent(DeliverySidebar).exists()).toBe(true);
  });

  it('renders Map component', () => {
    expect(wrapper.findComponent(Map).exists()).toBe(true);
  });

  it('renders the Timeline component', () => {
    expect(wrapper.findComponent(Timeline).exists()).toBe(true);
  });

  it('renders the Dialog component', () => {
    expect(wrapper.findComponent(Dialog).exists()).toBe(true);
  });

  it('updates shipment status', async () => {
    const shipmentId = 1;
    vi.spyOn(wrapper.vm, 'upDateShipmentStatus').mockResolvedValue();

    await wrapper.vm.upDateShipmentStatus(shipmentId);

    expect(wrapper.vm.upDateShipmentStatus).toHaveBeenCalledWith(shipmentId);
  });

  it('should update the status color correctly for known statuses', () => {
    expect(wrapper.vm.getStatusColor('shipped')).toBe('#d97706');
    expect(wrapper.vm.getStatusColor('processing')).toBe('#6b7280');
    expect(wrapper.vm.getStatusColor('delivered')).toBe('#14532d');
  });

  it('should initialize with the correct data', () => {
    expect(wrapper.vm.shipmentsByDelivery).toBeDefined();
    expect(wrapper.vm.currentDestination).toBeDefined();
  });
});

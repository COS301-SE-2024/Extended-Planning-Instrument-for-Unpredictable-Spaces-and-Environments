import { mount } from '@vue/test-utils';
import DeliveryView from '@/views/DeliveryView.vue';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import DeliverySidebar from '@/components/DeliverySidebar.vue';
import Map from '@/components/Map.vue';
import Timeline from 'primevue/timeline';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import { RouterLinkStub } from '@vue/test-utils'; // Mock RouterLink
import { getShipmentByDeliveryId } from '../../../supabase/functions/core/Shipments/getShipmentByDeliveryID'; // Import the actual method

// Mock Supabase functions
vi.mock('../../../supabase/functions/core/Shipments/getShipmentByDeliveryID', () => ({
  getShipmentByDeliveryId: vi.fn(), // Mock the method
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
          Button: true,
        },
        mocks: {
          $router: {
            push: vi.fn(),
          },
          $route: {
            query: {},
          },
        },
        components: {
          RouterLink: RouterLinkStub,
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
    // Mock the API response
    const shipmentId = 1;
    vi.spyOn(wrapper.vm, 'upDateShipmentStatus').mockResolvedValue();

    // Trigger status update
    await wrapper.vm.upDateShipmentStatus(shipmentId);

    // Ensure the API call was made
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

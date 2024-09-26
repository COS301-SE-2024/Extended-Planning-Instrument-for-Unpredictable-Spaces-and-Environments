import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import Shipments from '@/views/Shipments.vue'
import { useDark } from '@vueuse/core'
import { supabase } from '@/supabase.js'

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ({
    value: false,
  })),
}))

vi.mock('@/supabase.js', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
  },
}))

describe('Shipments.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Shipments, {
      global: {
        stubs: ['Sidebar', 'DialogComponent', 'InputText', 'Dropdown', 'DataTable', 'Column', 'Button', 'Dialog'],
      },
      data() {
        return {
          selectedUser: {
            FullName: '',
            Email: '',
            Role: '',
            Phone: '',
          },
        }
      },
    })
  })

  it('should mount the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should toggle dark mode', async () => {
    const darkMode = useDark()
    expect(wrapper.vm.isDark.value).toBe(false) // Initial state is light mode
    await wrapper.vm.toggleDark()
    expect(wrapper.vm.isDark.value).toBe(true) // Dark mode is toggled on
    await wrapper.vm.toggleDark()
    expect(wrapper.vm.isDark.value).toBe(false) // Dark mode is toggled off
  })

  it('should update the global filter on user input', async () => {
    const input = { target: { value: 'test shipment' } }
    await wrapper.vm.onGlobalFilterChange(input)
    expect(wrapper.vm.filters.global.value).toBe('test shipment')
  })

})

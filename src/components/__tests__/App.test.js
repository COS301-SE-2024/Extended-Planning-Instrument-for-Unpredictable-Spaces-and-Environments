import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'
import { RouterView } from 'vue-router'

describe('App.vue', () => {
  it('should mount the component', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render the router-view', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          RouterView: true, // Stubbing the RouterView
        },
      },
    })

    expect(wrapper.findComponent(RouterView).exists()).toBe(true)
  })
})

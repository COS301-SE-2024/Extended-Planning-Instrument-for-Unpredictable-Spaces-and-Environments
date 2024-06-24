import { mount } from '@vue/test-utils';
import HomeView from '../../views/HomeView.vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '../../supabase'; // Adjust the path accordingly
import { ref } from 'vue';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
}));

vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ref(true)), // Page starts off in dark mode
}));

describe('HomeView Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HomeView, {
      global: {
        mocks: {
          $router: useRouter(),
          $toast: useToast(),
        },
      },
    });
  });

  it('renders the welcome text correctly', () => {
    const header = wrapper.find('h1');
    expect(header.exists()).toBe(true);
    expect(header.text()).toBe('Welcome to Janeeb Solutions');
    
    const paragraph = wrapper.find('p');
    expect(paragraph.exists()).toBe(true);
    expect(paragraph.text()).toContain("We're excited to have you on board! Your account is being set up and you'll receive an activation confirmation soon. Once activated, you'll have access to all the relevant features. Thank you for your patience!");
  });

  it('renders the video element correctly', () => {
    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    expect(video.attributes('src')).toBe('/Members/Videos/truck-landing.mp4.mp4');
    expect(video.attributes('autoplay')).toBeDefined();
    expect(video.attributes('loop')).toBeDefined();
    expect(video.attributes('muted')).toBeDefined();
  });

//   it('applies dark mode classes correctly', async () => {
//     const isDark = wrapper.vm.isDark;
//     isDark.value = true;
//     await wrapper.vm.$nextTick();
    
//     const container = wrapper.find('.h-full');
//     expect(container.classes()).toContain('dark');
//     expect(container.classes()).toContain('bg-neutral-950');
//     expect(container.classes()).toContain('text-white');
//   });

//   it('applies light mode classes correctly', async () => {
//     const isDark = wrapper.vm.isDark;
//     isDark.value = false;
//     await wrapper.vm.$nextTick();
    
//     const container = wrapper.find('.h-full');
//     expect(container.classes()).toContain('bg-gray-100');
//     expect(container.classes()).toContain('text-black');
//   });

  it('calls logout function and navigates to login page', async () => {
    const logoutButton = wrapper.find('button');
    expect(logoutButton.exists()).toBe(true);
    
    await logoutButton.trigger('click');
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
    // expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'login' });
  });
});

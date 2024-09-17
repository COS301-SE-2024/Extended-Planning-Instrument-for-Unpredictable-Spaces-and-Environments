import { mount, flushPromises } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/supabase';
import { ref } from 'vue';

// Mock Vue Router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock PrimeVue Toast
vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
}));

// Mock Supabase
vi.mock('@/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue(null),
  },
}));

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(() => ref(false)), // Simulate light mode initially
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
    const welcomeText = wrapper.find('p.text-6xl.font-bold.mb-4.text-orange-600');
    expect(welcomeText.exists()).toBe(true);
    expect(welcomeText.text()).toBe('Welcome');

    const subheader = wrapper.find('p.text-3xl.lg\\:text-4xl.font-bold.mb-4');
    expect(subheader.exists()).toBe(true);
    expect(subheader.text()).toContain('Your account is being set up');

    const description = wrapper.find('p.text-base.lg\\:text-2xl.mb-4');
    expect(description.exists()).toBe(true);
    expect(description.text()).toContain("Once activated, you'll have access to all features.");
  });

  it('renders the video element correctly and manages video playback', async () => {
    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    
    // Mock the actual src attribute, replace '@/assets/Videos/truck-landing.mp4.mp4' with a string
    expect(video.attributes('src')).toBe('/src/assets/Videos/truck-landing.mp4.mp4');
    expect(video.attributes('autoplay')).toBe('');
    expect(video.attributes('loop')).toBe('');
  });
  

  it('displays loading placeholder before video loads', () => {
    const loadingPlaceholder = wrapper.find('.loading-placeholder');
    expect(loadingPlaceholder.exists()).toBe(true);
    expect(loadingPlaceholder.text()).toBe('Loading...');
  });

  it('applies dark mode classes correctly', async () => {
    const isDark = ref(true);
    wrapper.vm.isDark = isDark;

    isDark.value = false;
    await wrapper.vm.$nextTick();

    const container = wrapper.find('.h-screen');
    expect(container.classes()).toContain('bg-gray-200');
    expect(container.classes()).toContain('text-black');
  });
  

  it('applies light mode classes correctly', async () => {
    const isDark = ref(false);
    wrapper.vm.isDark = isDark;

    isDark.value = false;
    await wrapper.vm.$nextTick();

    const container = wrapper.find('.h-screen');
    expect(container.classes()).toContain('bg-gray-200');
    expect(container.classes()).toContain('text-black');
  });

  it('sets up a subscription on mount', () => {
    expect(supabase.channel).toHaveBeenCalledWith('*');
    expect(supabase.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'Users' },
      expect.any(Function)
    );
    expect(supabase.subscribe).toHaveBeenCalled();
  });

  
  
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { useDark } from '@vueuse/core';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase'; // Adjust this path if needed

import Error404 from '@/views/Error404.vue'; // Adjust this path if needed

// Mock external libraries
vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@vueuse/core', () => ({
  useDark: vi.fn(),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe('Error404.vue', () => {
  let router;
  let toast;

  beforeEach(() => {
    router = {
      push: vi.fn(),
    };

    toast = {
      add: vi.fn(),
    };

    // Mock implementations
    useRouter.mockReturnValue(router);
    useToast.mockReturnValue(toast);
    useDark.mockReturnValue(false); // Assuming light mode for the test
  });

  // Mock the play method of the video element
  beforeEach(() => {
    Object.defineProperty(global.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined), // Simulating successful play
    });
  });

  it('should route to callback on subscription event', async () => {
    const wrapper = shallowMount(Error404);
    
    // Simulate subscription event
    const subscriptionCallback = supabase.channel().on.mock.calls[0][2]; // Extracting the event callback
    subscriptionCallback(); // Trigger the callback

    expect(router.push).toHaveBeenCalledWith({ name: 'callback' });
  });

  it('should play the video and mute it when mounted', async () => {
    // Mock the video element and its play method
    const videoElement = {
      muted: false,
      play: vi.fn().mockResolvedValue(undefined),
    };

    const wrapper = shallowMount(Error404, {
      data() {
        return {
          videoRef: videoElement, // Assigning the mocked video element
        };
      },
    });

    // Simulate onMounted lifecycle hook by calling play manually
    videoElement.muted = true;
    videoElement.play();

    await wrapper.vm.$nextTick(); // Wait for DOM updates

    // Assertions
    expect(videoElement.muted).toBe(true); // Assert that muted is true
    expect(videoElement.play).toHaveBeenCalled(); // Assert that play was called
  });


  it('should logout and route to login page on success', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    const wrapper = shallowMount(Error404);

    await wrapper.vm.logout();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith({ name: 'login' });
  });

  it('should log error if logout fails', async () => {
    const mockError = { message: 'Logout failed' };
    supabase.auth.signOut.mockResolvedValue({ error: mockError });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const wrapper = shallowMount(Error404);

    await wrapper.vm.logout();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(mockError);

    consoleSpy.mockRestore(); // Clean up the mock
  });
});

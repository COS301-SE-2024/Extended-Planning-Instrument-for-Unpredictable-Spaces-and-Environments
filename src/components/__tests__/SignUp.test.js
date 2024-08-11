import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SignUp from '../SignUp.vue';

describe('SignUp.vue', () => {
  
  it('renders correctly', () => {
    const wrapper = mount(SignUp);
    expect(wrapper.exists()).toBe(true);
  });

  it('contains a submit button', () => {
    const wrapper = mount(SignUp);
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
  });

  it('emits submit event when form is submitted', async () => {
    const wrapper = mount(SignUp);
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.emitted('submit')).toBeTruthy();
  });

  it('toggles dark mode', async () => {
    const wrapper = mount(SignUp);
    const darkModeToggle = wrapper.find('.cursor-pointer');
    if (darkModeToggle.exists()) {
      await darkModeToggle.trigger('click');
      const isDark = wrapper.classes().includes('dark');
      expect(isDark).toBe(true);
    } else {
      throw new Error('Dark mode toggle button not found');
    }
  });

});

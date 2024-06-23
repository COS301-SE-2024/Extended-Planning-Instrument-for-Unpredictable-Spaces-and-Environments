import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SignUpView from '../../views/SignUpView.vue';
import SignUp from '../../components/SignUp.vue';

describe('SignUpView.vue', () => {
  it('renders the component', () => {
    const wrapper = mount(SignUpView);
    expect(wrapper.exists()).toBe(true);
  });

  it('contains a welcome section', () => {
    const wrapper = mount(SignUpView);
    const welcomeSection = wrapper.find('.welcome-section');
    expect(welcomeSection.exists()).toBe(true);
  });

  it('renders the SignUp component', () => {
    const wrapper = mount(SignUpView);
    const signUpComponent = wrapper.findComponent(SignUp);
    expect(signUpComponent.exists()).toBe(true);
  });
});
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SignUpView from '../../views/SignUpView.vue';
import SignUp from '../../components/SignUp.vue';

// Mock the Supabase client to avoid real initialization
const supabaseMock = {
  auth: {
    signUp: vi.fn().mockResolvedValue({ user: {}, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
};

// Mock the Supabase import
vi.mock('../../supabase', () => ({
  supabase: supabaseMock,
}));

describe('SignUpView.vue', () => {
  // Mock SignUp component to avoid unnecessary deep component rendering
  vi.mock('../../components/SignUp.vue', () => ({
    default: {
      name: 'SignUp',
      template: '<div class="mock-signup-component"></div>',
    },
  }));

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

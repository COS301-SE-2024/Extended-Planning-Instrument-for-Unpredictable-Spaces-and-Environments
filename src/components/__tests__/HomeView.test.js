import { mount } from '@vue/test-utils';
import HomeView from '../../views/HomeView.vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('HomeView Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HomeView);
  });

  it('renders the header with correct text', () => {
    const header = wrapper.find('.header');
    expect(header.exists()).toBe(true);
    expect(header.find('h1').text()).toBe("Unlocking South Africa's Logistics Potential");
    expect(header.find('p').text()).toBe("Revolutionizing Efficiency in Logistics with Intelligent Packing and Optimal Space Management");
  });

  it('renders the introduction section with correct text', () => {
    const introduction = wrapper.find('.introduction');
    expect(introduction.exists()).toBe(true);
    expect(introduction.find('h2').text()).toBe("Introduction");
    expect(introduction.find('p').text()).toContain("Unlocking the potential within South Africa's logistics juggernaut");
  });

  it('renders the background & motivation section with correct text', () => {
    const backgroundMotivation = wrapper.find('.background-motivation');
    expect(backgroundMotivation.exists()).toBe(true);
    expect(backgroundMotivation.find('h2').text()).toBe("Background & Motivation");
    expect(backgroundMotivation.find('p').text()).toContain("The motivation behind this project is rooted in the recognition of these missed opportunities");
  });

  it('renders the system requirements section with correct text and lists', () => {
    const systemRequirements = wrapper.find('.system-requirements');
    expect(systemRequirements.exists()).toBe(true);
    expect(systemRequirements.find('h2').text()).toBe("System Requirements");
    expect(systemRequirements.find('h3').text()).toBe("Core Requirements");

    const coreRequirements = systemRequirements.findAll('ol')[0].findAll('li');
    expect(coreRequirements.length).toBe(4);
    expect(coreRequirements[0].text()).toContain("Design an algorithm to dynamically adjust the placement of goods in real-time");
  });
});

import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Load .env.local file for Vitest
dotenv.config({ path: '.env.local' });

export default defineConfig({
  test: {
    environment: 'jsdom', // Make sure you are using jsdom for DOM-based testing
    setupFiles: ['./testSetup.js'], // Optional: Use a setup file for additional configurations
    globals: true, // Allows using `global` variables like in Jest
  },
});

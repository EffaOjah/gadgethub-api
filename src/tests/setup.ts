import { vi } from 'vitest';

// Silence console.log and console.error during tests to keep output clean
// Expected errors (like 404s or 500s we test for) won't clutter the terminal
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

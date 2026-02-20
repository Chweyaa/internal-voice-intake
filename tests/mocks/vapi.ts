import { vi } from 'vitest';

export const mockVapiInstance = {
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  on: vi.fn(),
};

class MockVapi {
  start = mockVapiInstance.start;
  stop = mockVapiInstance.stop;
  on = mockVapiInstance.on;
}

vi.mock('@vapi-ai/web', () => ({
  default: MockVapi,
}));

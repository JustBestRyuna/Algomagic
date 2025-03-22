import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { installGlobals } from '@remix-run/node';

installGlobals();

// 각 테스트 이후 cleanup 실행
afterEach(() => {
  cleanup();
});

// 환경 변수 모킹
vi.mock('./app/utils/env.server', () => ({
  getEnv: () => ({
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SESSION_SECRET: 'test-session-secret',
  }),
}));

// fetch 모킹 (MSW 사용을 고려)
Object.defineProperty(global, 'fetch', {
  value: vi.fn(),
  writable: true,
});

// 창 크기 설정 (반응형 테스트를 위함)
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768,
}); 
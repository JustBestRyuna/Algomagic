import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { vi } from 'vitest';
import type { RenderOptions } from '@testing-library/react';
import { createRemixStub } from '@remix-run/testing';
import { MemoryRouter } from 'react-router-dom';

// 기본 렌더 래퍼
function render(
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  return rtlRender(ui, {
    ...options,
  });
}

// 라우터로 감싸진 렌더 함수
export function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
}

// Remix 라우트 테스트를 위한 렌더 유틸리티
export function renderRoute(
  initialPath: string,
  routes: Record<string, any>,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  // RemixStub 컴포넌트 생성 (더 단순화)
  const RemixStub = createRemixStub(
    Object.entries(routes).map(([path, routeConfig]) => ({
      path: path === '/*' ? path : path,
      element: routeConfig.element,
      children: routeConfig.children || undefined,
      loader: routeConfig.loader || undefined,
      action: routeConfig.action || undefined,
      errorElement: routeConfig.errorElement || undefined,
    }))
  );
  
  return rtlRender(<RemixStub initialEntries={[initialPath]} />, options);
}

// Supabase 모킹
export function mockSupabase(data: any = {}) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: data,
          error: null,
        }),
      }),
    }),
  };
}

export * from '@testing-library/react';
export { render }; 
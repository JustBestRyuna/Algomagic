import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '../test-utils';
import CategoryIndex from '../../app/routes/$difficulty.$category._index';

// useLoaderData 모킹
vi.mock('@remix-run/react', () => ({
  useLoaderData: () => ({
    difficulty: 'tutorial',
    difficultyName: '튜토리얼',
    category: 'output',
    categoryName: '출력',
    problems: [
      { id: 'hello-world', title: 'Hello World', description: '첫 프로그래밍' },
      { id: 'cat', title: '고양이', description: '고양이 출력하기' },
    ],
    colors: { 
      primary: '#7c3aed',
      secondary: '#9333ea',
      shade: 'purple'
    }
  }),
  Link: ({ to, children, ...props }: { to: string, children: React.ReactNode, [key: string]: any }) => (
    <a href={to} {...props}>{children}</a>
  ),
  Form: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
    <form {...props}>{children}</form>
  ),
}));

// Supabase 응답 모킹
vi.mock('../../app/utils/supabase.server', () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table === 'difficulties') {
        return {
          select: () => ({
            eq: () => ({
              single: () => ({
                data: { id: 'tutorial', title: '튜토리얼', description: '프로그래밍 기초' },
                error: null,
              }),
            }),
          }),
        };
      }
      
      if (table === 'categories') {
        return {
          select: () => ({
            eq: () => ({
              data: [
                { id: 'output', title: '출력', description: '출력 관련 문제', icon_id: 'code' },
                { id: 'arithmetic', title: '사칙연산', description: '사칙연산 관련 문제', icon_id: 'calculator' },
              ],
              error: null,
            }),
            eq2: () => ({
              single: () => ({
                data: { id: 'output', title: '출력', description: '출력 관련 문제', icon_id: 'code' },
                error: null,
              }),
            }),
          }),
        };
      }
      
      if (table === 'problems') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  data: [
                    { id: 'hello-world', title: 'Hello World', description: '첫 프로그래밍' },
                    { id: 'cat', title: '고양이', description: '고양이 출력하기' },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      
      return {
        select: () => ({
          data: [],
          error: null,
        }),
      };
    },
  }),
}));

describe('카테고리 페이지', () => {
  it('카테고리 페이지가 올바르게 렌더링되어야 함', async () => {
    // 테스트용 라우트 파라미터 설정
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useParams: () => ({
          difficulty: 'tutorial',
          category: 'output'
        }),
      };
    });

    // CategoryIndex 컴포넌트 렌더링
    renderWithRouter(<CategoryIndex />);

    // 카테고리 페이지 제목 확인 (contains 텍스트 사용)
    const h1Element = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'h1' && content.includes('출력');
    });
    expect(h1Element).toBeInTheDocument();
    
    // 카테고리 설명 확인 - 첫 번째 요소만 확인
    expect(screen.getAllByText((content) => content.includes('출력') && content.includes('문제'))[0])
      .toBeInTheDocument();
    
    // 문제 목록 확인
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('고양이')).toBeInTheDocument();
    
    // 문제 링크 확인 (getAllByRole 사용)
    expect(screen.getAllByRole('link', { name: /Hello World/i })[0]).toHaveAttribute(
      'href',
      '/tutorial/output/hello-world'
    );
    expect(screen.getAllByRole('link', { name: /고양이/i })[0]).toHaveAttribute(
      'href',
      '/tutorial/output/cat'
    );
    
    // 상위 카테고리로 이동하는 링크 확인
    expect(screen.getAllByRole('link', { name: (content) => content.includes('튜토리얼') })[0]).toHaveAttribute(
      'href',
      '/tutorial'
    );
  });
}); 
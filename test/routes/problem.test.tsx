import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '../test-utils';
import ProblemPage from '../../app/routes/$difficulty.$category.$problem';

// useLoaderData 및 useMemo 모킹
vi.mock('@remix-run/react', () => ({
  useLoaderData: () => ({
    difficulty: 'tutorial',
    difficultyName: '튜토리얼',
    category: 'output',
    categoryName: '출력',
    problem: {
      id: 'hello-world',
      title: 'Hello World',
      description: '프로그래밍의 첫 걸음',
      content: '# Hello World\n\n첫 프로그래밍 문제입니다.',
      solution_idea: '출력 함수를 사용하세요',
      python_code: 'print("Hello World!")',
      cpp_code: '#include<iostream>\nint main() {\n  std::cout << "Hello World!" << std::endl;\n  return 0;\n}',
      input: '입력이 없습니다.',
      output: 'Hello World!',
    },
    examples: [
      {
        problem_id: 'hello-world',
        input: '',
        output: 'Hello World!',
        explanation: '출력 예시입니다.',
      },
    ],
    mdxSource: '# Hello World\n\n첫 프로그래밍 문제입니다.',
    colors: { 
      primary: '#7c3aed',
      secondary: '#9333ea',
      shade: 'purple'
    }
  }),
  Link: ({ to, children }: { to: string, children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  Form: ({ children }: { children: React.ReactNode }) => (
    <form>{children}</form>
  ),
}));

// useMemo 모킹
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useMemo: (fn) => fn(),
  };
});

// getMDXComponent 모킹
vi.mock('mdx-bundler/client', () => ({
  getMDXComponent: () => ({ 
    props 
  }: { 
    props: any 
  }) => (
    <div>
      <h1>Hello World</h1>
      <p>첫 프로그래밍 문제입니다.</p>
    </div>
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
                eq: () => ({
                  single: () => ({
                    data: {
                      id: 'hello-world',
                      title: 'Hello World',
                      description: '프로그래밍의 첫 걸음',
                      content: '# Hello World\n\n첫 프로그래밍 문제입니다.',
                      solution_idea: '출력 함수를 사용하세요',
                      python_code: 'print("Hello World!")',
                      cpp_code: '#include<iostream>\nint main() {\n  std::cout << "Hello World!" << std::endl;\n  return 0;\n}',
                      input: '입력이 없습니다.',
                      output: 'Hello World!',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      
      if (table === 'examples') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  data: [
                    {
                      problem_id: 'hello-world',
                      input: '',
                      output: 'Hello World!',
                      explanation: '출력 예시입니다.',
                    },
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

describe('문제 페이지', () => {
  it('문제 페이지가 올바르게 렌더링되어야 함', async () => {
    // 테스트용 라우트 파라미터 설정
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useParams: () => ({
          difficulty: 'tutorial',
          category: 'output',
          problem: 'hello-world'
        }),
      };
    });

    // ProblemPage 컴포넌트 렌더링
    renderWithRouter(<ProblemPage />);

    // 문제 제목 확인
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    
    // 문제 내용 확인
    expect(screen.getByText(/첫 프로그래밍 문제입니다/)).toBeInTheDocument();
    
    // 상위 카테고리 링크 확인 - 출력 카테고리 확인
    const outputLinks = screen.getAllByText((content) => content.includes('출력'));
    expect(outputLinks.length).toBeGreaterThan(0);
    
    // 상위 난이도 링크 확인 - 튜토리얼 난이도 확인
    const tutorialLinks = screen.getAllByText((content) => content.includes('튜토리얼'));
    expect(tutorialLinks.length).toBeGreaterThan(0);
  });
}); 
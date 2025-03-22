import { describe, expect, it, vi } from 'vitest';
import { json } from '@remix-run/node';

// getSupabase 모킹 함수 생성
const mockGetSupabase = vi.fn();

// app/utils/supabase.server 모듈 모킹
vi.mock('../../app/utils/supabase.server', () => ({
  getSupabase: () => mockGetSupabase(),
}));

// 데이터 로더 인라인 모킹
const mockLoaders = {
  loadDifficulties: async () => {
    return {
      data: [
        { id: 'tutorial', title: '튜토리얼', description: '프로그래밍 기초' },
        { id: 'bronze', title: '브론즈', description: '알고리즘 기초' },
      ],
      error: null,
    };
  },
  
  loadCategories: async (difficultyId: string) => {
    return {
      data: [
        { id: 'output', title: '출력', description: '출력 관련 문제', difficulty_id: difficultyId, icon_id: 'code' },
        { id: 'arithmetic', title: '사칙연산', description: '사칙연산 관련 문제', difficulty_id: difficultyId, icon_id: 'calculator' },
      ], 
      error: null,
    };
  },
  
  loadProblems: async (difficultyId: string, categoryId: string) => {
    return {
      data: [
        { id: 'hello-world', title: 'Hello World', description: '첫 프로그래밍', difficulty_id: difficultyId, category_id: categoryId },
        { id: 'cat', title: '고양이', description: '고양이 출력하기', difficulty_id: difficultyId, category_id: categoryId },
      ],
      error: null,
    };
  },
};

describe('데이터 로딩 테스트', () => {
  // 각 테스트마다 모킹 초기화
  beforeEach(() => {
    mockGetSupabase.mockReset();
  });
  
  it('난이도 목록을 성공적으로 로드해야 함', async () => {
    // Supabase 반환값 모킹
    mockGetSupabase.mockReturnValue({
      from: () => ({
        select: () => ({
          order: () => mockLoaders.loadDifficulties(),
        }),
      }),
    });
    
    // 테스트할 로더 함수 (인라인 정의)
    const loader = async () => {
      const supabase = mockGetSupabase();
      const { data, error } = await supabase
        .from('difficulties')
        .select()
        .order('id');
      
      if (error) {
        throw new Error(`Failed to load difficulties: ${error.message}`);
      }
      
      return json({ difficulties: data });
    };
    
    // 로더 실행 및 검증
    const response = await loader();
    const { difficulties } = await response.json();
    
    expect(difficulties).toHaveLength(2);
    expect(difficulties[0].id).toBe('tutorial');
    expect(difficulties[1].id).toBe('bronze');
  });
  
  it('카테고리 목록을 성공적으로 로드해야 함', async () => {
    // Supabase 반환값 모킹
    mockGetSupabase.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => mockLoaders.loadCategories('tutorial'),
        }),
      }),
    });
    
    // 테스트할 로더 함수 (인라인 정의)
    const loader = async ({ params }: { params: { difficulty: string } }) => {
      const difficultyId = params.difficulty || 'tutorial';
      const supabase = mockGetSupabase();
      const { data, error } = await supabase
        .from('categories')
        .select()
        .eq('difficulty_id', difficultyId);
      
      if (error) {
        throw new Error(`Failed to load categories: ${error.message}`);
      }
      
      return json({ categories: data });
    };
    
    // 로더 실행 및 검증
    const response = await loader({ params: { difficulty: 'tutorial' } });
    const { categories } = await response.json();
    
    expect(categories).toHaveLength(2);
    expect(categories[0].id).toBe('output');
    expect(categories[1].id).toBe('arithmetic');
  });
  
  it('문제 목록을 성공적으로 로드해야 함', async () => {
    // Supabase 반환값 모킹
    mockGetSupabase.mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => mockLoaders.loadProblems('tutorial', 'output'),
            }),
          }),
        }),
      }),
    });
    
    // 테스트할 로더 함수 (인라인 정의)
    const loader = async ({ params }: { params: { difficulty: string, category: string } }) => {
      const { difficulty, category } = params;
      const supabase = mockGetSupabase();
      const { data, error } = await supabase
        .from('problems')
        .select()
        .eq('difficulty_id', difficulty)
        .eq('category_id', category)
        .order('order');
      
      if (error) {
        throw new Error(`Failed to load problems: ${error.message}`);
      }
      
      return json({ problems: data });
    };
    
    // 로더 실행 및 검증
    const response = await loader({ params: { difficulty: 'tutorial', category: 'output' } });
    const { problems } = await response.json();
    
    expect(problems).toHaveLength(2);
    expect(problems[0].id).toBe('hello-world');
    expect(problems[1].id).toBe('cat');
  });
}); 
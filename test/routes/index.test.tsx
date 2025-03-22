import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '../test-utils';
import Index from '../../app/routes/_index';

// Supabase 모킹 - 난이도 데이터
const mockDifficulties = [
  { id: 'tutorial', title: '튜토리얼', description: '프로그래밍 기초를 배우는 문제들' },
  { id: 'bronze', title: '브론즈', description: '알고리즘 기초 문제들' },
];

vi.mock('../../app/utils/supabase.server', () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table === 'difficulties') {
        return {
          select: () => ({
            order: () => ({
              data: mockDifficulties,
              error: null,
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

describe('메인 페이지', () => {
  it('메인 페이지 UI가 올바르게 렌더링되어야 함', async () => {
    // 테스트용 Index 컴포넌트를 직접 렌더링
    renderWithRouter(<Index />);
    
    // 메인 페이지 요소 확인 - 여러 제목이 있으므로 getAllByRole 사용
    const headings = screen.getAllByRole('heading', { name: /알고매직/ });
    expect(headings.length).toBeGreaterThan(0);
    
    // 주요 섹션 존재 확인 - 정확한 텍스트로 변경
    expect(screen.getByText(/알고리즘 학습의 새로운 방법/)).toBeInTheDocument();
    
    // 링크 확인 - 중복된 링크는 getAllByText 사용
    expect(screen.getAllByText('튜토리얼 시작하기')[0]).toBeInTheDocument();
    expect(screen.getAllByText('브론즈 문제 풀기')[0]).toBeInTheDocument();
    
    // 특징 섹션 확인
    expect(screen.getByText('알고매직 특징')).toBeInTheDocument();
    expect(screen.getByText('알고리즘 학습을 더 효과적으로')).toBeInTheDocument();
  });
}); 
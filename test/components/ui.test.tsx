import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from '../../app/components/Navigation';
import { Footer } from '../../app/components/Footer';
import ProblemLayout from '../../app/components/ProblemLayout';

// 필요한 경우 props 모킹
const mockProblemProps = {
  title: 'Hello World',
  difficulty: '튜토리얼',
  category: '출력',
  categoryPath: 'output',
  solutionIdea: '출력 함수를 사용하세요',
  pythonCode: 'print("Hello World!")',
  cppCode: '#include<iostream>\nint main() {\n  std::cout << "Hello World!" << std::endl;\n  return 0;\n}',
  children: <div>첫 프로그래밍 문제입니다.</div>
};

// 라우터로 감싸진 렌더 함수
function renderWithRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
}

describe('UI 컴포넌트 테스트', () => {
  it('네비게이션 컴포넌트가 올바르게 렌더링되어야 함', () => {
    renderWithRouter(<Navigation />);
    
    // 네비게이션 존재 확인
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // 로고/홈 링크 확인
    expect(screen.getByRole('link', { name: '알고매직' })).toHaveAttribute('href', '/');
    
    // 메인 내비게이션 링크 확인 - 홈은 여러 개 있으므로 getAllByRole 사용
    const homeLinks = screen.getAllByRole('link', { name: '홈' });
    expect(homeLinks[0]).toHaveAttribute('href', '/');
    
    expect(screen.getAllByRole('link', { name: '튜토리얼' })[0]).toHaveAttribute('href', '/tutorial');
    expect(screen.getAllByRole('link', { name: '브론즈' })[0]).toHaveAttribute('href', '/bronze');
    
    // MVP 버전 텍스트 확인
    expect(screen.getByText('MVP 버전')).toBeInTheDocument();
  });
  
  it('푸터 컴포넌트가 올바르게 렌더링되어야 함', () => {
    render(<Footer />);
    
    // 푸터 존재 확인
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    
    // 링크 확인
    expect(screen.getByRole('link', { name: '소개' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '제안하기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    
    // 저작권 정보 확인
    expect(screen.getByText(/© 2024 알고매직/)).toBeInTheDocument();
  });
  
  it('문제 레이아웃 컴포넌트가 올바르게 렌더링되어야 함', () => {
    renderWithRouter(
      <ProblemLayout
        title={mockProblemProps.title}
        difficulty={mockProblemProps.difficulty}
        category={mockProblemProps.category}
        categoryPath={mockProblemProps.categoryPath}
        solutionIdea={mockProblemProps.solutionIdea}
        pythonCode={mockProblemProps.pythonCode}
        cppCode={mockProblemProps.cppCode}
      >
        {mockProblemProps.children}
      </ProblemLayout>
    );
    
    // 문제 제목 확인
    expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    
    // 문제 설명 확인
    expect(screen.getByText('첫 프로그래밍 문제입니다.')).toBeInTheDocument();
    
    // 카테고리 정보 확인
    expect(screen.getByText(/출력 카테고리로 돌아가기/)).toBeInTheDocument();
    
    // 난이도와 카테고리 배지 확인
    expect(screen.getByText('튜토리얼')).toBeInTheDocument();
    expect(screen.getByText('출력')).toBeInTheDocument();
    
    // 풀이 아이디어 및 코드 보기 버튼 확인 - 여러 개 있으므로 getAllByRole 사용
    expect(screen.getAllByRole('button', { name: /보기/ })[0]).toBeInTheDocument();
    expect(screen.getByText('모범 답안 코드')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('C++')).toBeInTheDocument();
  });
}); 
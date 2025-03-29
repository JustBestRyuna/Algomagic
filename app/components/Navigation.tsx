import { Link } from "@remix-run/react";
import Icon from "~/components/IconLibrary";
import { useState } from "react";
import { Search } from "~/components/Search";

// Navigation 컴포넌트에서 사용할 타입 정의
interface Difficulty {
  id: string;
  name: string;
  color_text: string;
  color_accent: string;
  color_bg_light: string;
  categoryCount: number;
  display_name?: string;
  orderIndex?: number;
}

interface NavigationProps {
  difficulties?: Array<Difficulty>;
}

export function Navigation({ difficulties }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 카테고리가 있는 난이도만 필터링
  const filteredDifficulties = difficulties || [];
  
  // 튜토리얼을 찾아서 맨 앞으로 이동시키는 직접적인 방법
  const tutorialDifficulty = filteredDifficulties.find(d => d.id === 'tutorial');
  const otherDifficulties = filteredDifficulties.filter(d => d.id !== 'tutorial');
  
  // 정렬된 배열 (튜토리얼이 맨 앞)
  const sortedDifficulties = tutorialDifficulty 
    ? [tutorialDifficulty, ...otherDifficulties] 
    : [...otherDifficulties];
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-800">
                알고매직
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                홈
              </Link>
              
              {/* 동적으로 난이도 메뉴 생성 */}
              {sortedDifficulties.map((difficulty) => (
                <Link
                  key={difficulty.id}
                  to={`/${difficulty.id}`}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:border-opacity-60"
                  style={{ 
                    color: difficulty.color_text || '#16a34a',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderBottomColor = difficulty.color_accent || '#15803d';
                    e.currentTarget.style.color = difficulty.color_accent || '#15803d';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderBottomColor = 'transparent';
                    e.currentTarget.style.color = difficulty.color_text || '#16a34a';
                  }}
                >
                  {difficulty.display_name || difficulty.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Search className="w-64 text-sm" />
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
              MVP 버전
            </span>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">메뉴 열기</span>
              <Icon iconId="menu" className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
          >
            홈
          </Link>
          
          {/* 동적으로 모바일 메뉴 생성 */}
          {sortedDifficulties.map((difficulty) => (
            <Link
              key={difficulty.id}
              to={`/${difficulty.id}`}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium hover:border-opacity-60"
              style={{ 
                color: difficulty.color_text || '#16a34a',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderBottomColor = difficulty.color_accent || '#15803d';
                e.currentTarget.style.color = difficulty.color_accent || '#15803d';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderBottomColor = 'transparent';
                e.currentTarget.style.color = difficulty.color_text || '#16a34a';
              }}
            >
              {difficulty.display_name || difficulty.name}
            </Link>
          ))}
          
          {/* 모바일 검색 폼 */}
          <div className="px-3 py-2">
            <Search className="w-full" />
          </div>
        </div>
      </div>
    </nav>
  );
} 
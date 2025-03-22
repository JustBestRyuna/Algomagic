import React, { useState, useEffect, useRef } from "react";
import { Link } from "@remix-run/react";
import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";

interface ProblemLayoutProps {
  title: string;
  difficulty: string;
  category: string;
  categoryPath: string;
  children: React.ReactNode;
  solutionIdea?: React.ReactNode | string;
  pythonCode?: string;
  cppCode?: string;
}

export default function ProblemLayout({
  title,
  difficulty,
  category,
  categoryPath,
  children,
  solutionIdea,
  pythonCode,
  cppCode,
}: ProblemLayoutProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [showPythonCode, setShowPythonCode] = useState(false);
  const [showCppCode, setShowCppCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  const pythonRef = useRef<HTMLPreElement>(null);
  const cppRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    // 서버 사이드 렌더링 환경에서는 실행하지 않음
    if (typeof window === 'undefined') return;
    
    // Prism 초기화 (필요한 언어 로드 확인)
    if (Prism.languages.cpp === undefined && Prism.languages.c) {
      Prism.languages.cpp = Prism.languages.extend('c', {});
    }
    
    // 초기 렌더링 및 코드 토글 시 구문 강조 적용
    if (showPythonCode && pythonRef.current) {
      Prism.highlightElement(pythonRef.current);
    }
    if (showCppCode && cppRef.current) {
      Prism.highlightElement(cppRef.current);
    }
  }, [showPythonCode, showCppCode]);
  
  const isLowercaseDifficulty = difficulty.toLowerCase();
  const isTutorial = isLowercaseDifficulty === "tutorial" || isLowercaseDifficulty === "튜토리얼";
  const isBronze = isLowercaseDifficulty === "bronze" || isLowercaseDifficulty === "브론즈";
  
  // 난이도별 테마 색상 선택
  const themeColors = {
    bgLight: isTutorial ? "bg-tutorial-50" : isBronze ? "bg-bronze-50" : "bg-gray-50",
    bgMedium: isTutorial ? "bg-tutorial-100" : isBronze ? "bg-bronze-100" : "bg-gray-100",
    bgDark: isTutorial ? "bg-tutorial-600" : isBronze ? "bg-bronze-600" : "bg-blue-600",
    textLight: isTutorial ? "text-tutorial-600" : isBronze ? "text-bronze-600" : "text-blue-600",
    textDark: isTutorial ? "text-tutorial-800" : isBronze ? "text-bronze-800" : "text-blue-800",
    borderLight: isTutorial ? "border-tutorial-200" : isBronze ? "border-bronze-200" : "border-gray-200",
    hoverBg: isTutorial ? "hover:bg-tutorial-100" : isBronze ? "hover:bg-bronze-100" : "hover:bg-gray-100",
  };

  // 영문 난이도 변환
  const difficultyPathMap: Record<string, string> = {
    "튜토리얼": "tutorial",
    "브론즈": "bronze",
  };
  
  const difficultyPath = difficultyPathMap[difficulty] || difficulty.toLowerCase();

  // 코드 복사 함수
  const copyToClipboard = (code: string, language: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopySuccess(language);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(() => {
        setCopySuccess("실패");
        setTimeout(() => setCopySuccess(null), 2000);
      });
  };

  return (
    <div className={`${themeColors.bgLight} min-h-screen pt-8 pb-16 px-4`}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className={`${themeColors.bgDark} py-6 px-6 text-white`}>
          <Link
            to={`/${difficultyPath}/${categoryPath}`}
            className="text-white hover:underline inline-flex items-center"
          >
            <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            {category} 카테고리로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold mt-2">{title}</h1>
          <div className="flex space-x-2 mt-2">
            <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
              {difficulty}
            </span>
            <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">문제 설명</h2>
          <div className="prose max-w-none mdx-content">{children}</div>
        </div>

        {solutionIdea && (
          <div className={`p-6 border-b ${themeColors.borderLight}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">풀이 아이디어</h2>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className={`${themeColors.textLight} hover:underline flex items-center`}
              >
                {showSolution ? (
                  <>
                    <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                    </svg>
                    숨기기
                  </>
                ) : (
                  <>
                    <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                    </svg>
                    보기
                  </>
                )}
              </button>
            </div>

            {showSolution && (
              <div className={`prose max-w-none ${themeColors.bgLight} p-4 rounded-lg`}>
                {typeof solutionIdea === "string" ? (
                  <div className="solution-markdown">
                    {solutionIdea.split('\n').map((line, i) => (
                      <p key={i}>{line.trim() !== '' ? line : <br />}</p>
                    ))}
                  </div>
                ) : (
                  solutionIdea
                )}
              </div>
            )}
          </div>
        )}

        {(pythonCode || cppCode) && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">모범 답안 코드</h2>

            <div className="space-y-6">
              {pythonCode && (
                <div className={`${themeColors.bgLight} p-4 rounded-lg`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Python</h3>
                    <button
                      onClick={() => setShowPythonCode(!showPythonCode)}
                      className={`${themeColors.textLight} hover:underline flex items-center text-sm`}
                    >
                      {showPythonCode ? (
                        <>
                          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                          </svg>
                          코드 숨기기
                        </>
                      ) : (
                        <>
                          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                            <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                          </svg>
                          코드 보기
                        </>
                      )}
                    </button>
                  </div>

                  {showPythonCode && (
                    <div className="code-block">
                      <span className="code-language-label">Python</span>
                      <button 
                        className="copy-button"
                        onClick={() => copyToClipboard(pythonCode, 'python')}
                      >
                        {copySuccess === 'python' ? '복사됨!' : '복사'}
                      </button>
                      <pre className="language-python" ref={pythonRef}>
                        <code className="language-python">{pythonCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {cppCode && (
                <div className={`${themeColors.bgLight} p-4 rounded-lg`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">C++</h3>
                    <button
                      onClick={() => setShowCppCode(!showCppCode)}
                      className={`${themeColors.textLight} hover:underline flex items-center text-sm`}
                    >
                      {showCppCode ? (
                        <>
                          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                          </svg>
                          코드 숨기기
                        </>
                      ) : (
                        <>
                          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                            <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                          </svg>
                          코드 보기
                        </>
                      )}
                    </button>
                  </div>

                  {showCppCode && (
                    <div className="code-block">
                      <span className="code-language-label">C++</span>
                      <button 
                        className="copy-button"
                        onClick={() => copyToClipboard(cppCode, 'cpp')}
                      >
                        {copySuccess === 'cpp' ? '복사됨!' : '복사'}
                      </button>
                      <pre className="language-cpp" ref={cppRef}>
                        <code className="language-cpp">{cppCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
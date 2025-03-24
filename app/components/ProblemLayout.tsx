import React, { useState, useEffect, useRef, HTMLAttributes } from "react";
import { Link } from "@remix-run/react";
import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-python";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import Icon from "~/components/IconLibrary";

interface ProblemLayoutProps {
  title: string;
  difficulty: string;
  category: string;
  categoryPath: string;
  children: React.ReactNode;
  solutionIdea?: React.ReactNode | string;
  pythonCode?: string;
  cppCode?: string;
  isRequired?: boolean;
  moduleOrder?: number | null;
  moduleDescription?: string | null;
  ojLink?: string | null;
  colors?: {
    bg: string;
    bgLight: string;
    hover: string;
    text: string;
    border: string;
    accent: string;
  };
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
  isRequired = false,
  moduleDescription = null,
  ojLink = null,
  colors,
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
    
    // 코드 블록을 미리 가공하여 실제 줄바꿈과 \n 텍스트를 구분하는 처리 추가
    const processPrismHighlighting = () => {
      if (showPythonCode && pythonRef.current) {
        console.log('Highlighting Python code');
        
        if (pythonRef.current.querySelector('code')) {
          const codeElement = pythonRef.current.querySelector('code');
          if (codeElement && pythonCode) {
            // 코드의 특수 표현(\\n)을 실제 줄바꿈으로 변경하여 분할을 정확히 수행
            // 1. \\n 표현을 임시 토큰으로 치환
            let preparedCode = pythonCode.replace(/\\\\n/g, '__ESCAPED_NEWLINE__');
            
            // 2. 실제 줄바꿈 문자(\\n)를 실제 줄바꿈으로 변환
            preparedCode = preparedCode.replace(/\\n/g, '\n');
            
            // 3. 분할 전 변환 상태 로깅
            console.log('Python code after newline preparation:', preparedCode);
            
            // 코드를 라인 단위로 분할 (실제 줄바꿈 기준)
            const codeLines = preparedCode.split('\n');
            console.log('Python code lines after split:', codeLines);
            
            // 각 라인을 개별적으로 처리
            let processedHTML = '';
            codeLines.forEach((line) => {
              // 라인이 주석으로 시작하는지 확인
              const isComment = line.trim().startsWith('#');
              
              // 임시 토큰을 다시 원래 표현(\n)으로 복원
              const processedLine = line.replace(/__ESCAPED_NEWLINE__/g, '\\n');
              
              // 빈 줄이면 <br>로 처리
              if (processedLine.trim() === '') {
                processedHTML += '<br>';
                return;
              }
              
              // 임시 요소를 생성하여 해당 라인에 대한 구문 강조 적용
              const tempElement = document.createElement('code');
              tempElement.className = 'language-python';
              tempElement.textContent = processedLine;
              
              // 구문 강조 적용
              Prism.highlightElement(tempElement);
              
              // 주석 여부에 따라 HTML 추가
              if (isComment) {
                // 이미 주석 스타일이 적용되어 있을 것
                processedHTML += tempElement.innerHTML + '<br>';
              } else {
                processedHTML += tempElement.innerHTML + '<br>';
              }
            });
            
            // 마지막 <br> 제거
            if (processedHTML.endsWith('<br>')) {
              processedHTML = processedHTML.slice(0, -4);
            }
            
            // 처리된 HTML을 적용
            codeElement.innerHTML = processedHTML;
            console.log('Final Python code HTML:', processedHTML);
          }
        }
      }
      
      if (showCppCode && cppRef.current) {
        console.log('Highlighting C++ code');
        
        if (cppRef.current.querySelector('code')) {
          const codeElement = cppRef.current.querySelector('code');
          if (codeElement && cppCode) {
            // 코드의 특수 표현(\\n)을 실제 줄바꿈으로 변경하여 분할을 정확히 수행
            // 1. \\n 표현을 임시 토큰으로 치환
            let preparedCode = cppCode.replace(/\\\\n/g, '__ESCAPED_NEWLINE__');
            
            // 2. 실제 줄바꿈 문자(\\n)를 실제 줄바꿈으로 변환
            preparedCode = preparedCode.replace(/\\n/g, '\n');
            
            // 3. 분할 전 변환 상태 로깅
            console.log('C++ code after newline preparation:', preparedCode);
            
            // 코드를 라인 단위로 분할 (실제 줄바꿈 기준)
            const codeLines = preparedCode.split('\n');
            console.log('C++ code lines after split:', codeLines);
            
            // 각 라인을 개별적으로 처리
            let processedHTML = '';
            codeLines.forEach((line) => {
              // 라인이 주석으로 시작하는지 확인
              const isComment = line.trim().startsWith('//');
              
              // 임시 토큰을 다시 원래 표현(\n)으로 복원
              const processedLine = line.replace(/__ESCAPED_NEWLINE__/g, '\\n');
              
              // 빈 줄이면 <br>로 처리
              if (processedLine.trim() === '') {
                processedHTML += '<br>';
                return;
              }
              
              // 임시 요소를 생성하여 해당 라인에 대한 구문 강조 적용
              const tempElement = document.createElement('code');
              tempElement.className = 'language-cpp';
              tempElement.textContent = processedLine;
              
              // 구문 강조 적용
              Prism.highlightElement(tempElement);
              
              // 주석 여부에 따라 HTML 추가
              if (isComment) {
                // 이미 주석 스타일이 적용되어 있을 것
                processedHTML += tempElement.innerHTML + '<br>';
              } else {
                processedHTML += tempElement.innerHTML + '<br>';
              }
            });
            
            // 마지막 <br> 제거
            if (processedHTML.endsWith('<br>')) {
              processedHTML = processedHTML.slice(0, -4);
            }
            
            // 처리된 HTML을 적용
            codeElement.innerHTML = processedHTML;
            console.log('Final C++ code HTML:', processedHTML);
          }
        }
      }
    };
    
    // 코드가 변경되거나 토글될 때 구문 강조 적용
    processPrismHighlighting();
    
    // Prism 설정 커스터마이징
    const originalHook = Prism.hooks.add;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Prism.hooks.add = function(hookName: string, callback: any) {
      if (hookName === 'complete') {
        const originalCallback = callback;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback = function(env: any) {
          originalCallback(env);
          
          // 줄바꿈 스타일이 유지되도록 함
          if (env.element && env.element.parentElement) {
            env.element.parentElement.style.whiteSpace = 'pre-wrap';
            env.element.parentElement.style.wordBreak = 'break-word';
            env.element.style.whiteSpace = 'pre-wrap';
            env.element.style.wordBreak = 'break-word';
          }
        };
      }
      return originalHook(hookName, callback);
    };
    
    // 정리 함수에서 원래 훅 함수 복원
    return () => {
      Prism.hooks.add = originalHook;
    };
  }, [showPythonCode, showCppCode, pythonCode, cppCode]);
  
  // 영문 난이도 변환
  const difficultyPathMap: Record<string, string> = {
    "튜토리얼": "tutorial",
    "브론즈": "bronze",
    "실버": "silver",
    "골드": "gold",
    "플래티넘": "platinum",
    "다이아몬드": "diamond",
    "루비": "ruby",
  };
  
  const difficultyPath = difficultyPathMap[difficulty] || difficulty.toLowerCase();

  // 코드 복사 함수
  const copyToClipboard = (code: string, language: string) => {
    // 화면에 보이는 것과 동일하게 \\n을 \n으로 변환한 코드를 복사
    let formattedCode = '';
    if (language === 'python' && pythonCode) {
      formattedCode = pythonCode.replace(/\\\\n/g, '\\n');
    } else if (language === 'cpp' && cppCode) {
      formattedCode = cppCode.replace(/\\\\n/g, '\\n');
    }
    
    // 디버깅 정보 출력
    console.log(`Copying ${language} code (transformed):`, formattedCode);
    
    navigator.clipboard.writeText(formattedCode)
      .then(() => {
        setCopySuccess(language);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(() => {
        setCopySuccess("실패");
        setTimeout(() => setCopySuccess(null), 2000);
      });
  };

  // 기본 색상 (colors prop이 없는 경우를 대비)
  const defaultColors = {
    bg: "#3b82f6", // bg-blue-500
    bgLight: "#f0f9ff", // bg-blue-50
    hover: "#dbeafe", // bg-blue-100
    text: "#2563eb", // text-blue-600
    border: "#bfdbfe", // border-blue-200
    accent: "#1d4ed8", // text-blue-700
  };

  // 사용할 색상 결정
  const themeColors = colors || defaultColors;
  
  // 마크다운 공통 컴포넌트 설정
  interface MarkdownComponentProps extends HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
    className?: string;
  }

  const markdownComponents = {
    h1: ({children, ...props}: MarkdownComponentProps) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>,
    h2: ({children, ...props}: MarkdownComponentProps) => <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>,
    h3: ({children, ...props}: MarkdownComponentProps) => <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>,
    p: ({children, ...props}: MarkdownComponentProps) => <p className="mb-4 whitespace-pre-wrap" {...props}>{children}</p>,
    ul: ({children, ...props}: MarkdownComponentProps) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props}>{children}</ul>,
    ol: ({children, ...props}: MarkdownComponentProps) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props}>{children}</ol>,
    li: ({children, ...props}: MarkdownComponentProps) => <li className="mb-1" {...props}>{children}</li>,
    table: ({children, ...props}: MarkdownComponentProps) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-gray-300" {...props}>{children}</table>
      </div>
    ),
    thead: ({children, ...props}: MarkdownComponentProps) => <thead className="bg-gray-100" {...props}>{children}</thead>,
    tbody: ({children, ...props}: MarkdownComponentProps) => <tbody className="divide-y divide-gray-300" {...props}>{children}</tbody>,
    tr: ({children, ...props}: MarkdownComponentProps) => <tr className="divide-x divide-gray-300" {...props}>{children}</tr>,
    th: ({children, ...props}: MarkdownComponentProps) => <th className="px-4 py-2 text-left font-semibold border border-gray-300" {...props}>{children}</th>,
    td: ({children, ...props}: MarkdownComponentProps) => <td className="px-4 py-2 border border-gray-300" {...props}>{children}</td>,
    pre: ({children}: MarkdownComponentProps) => (
      <pre className="bg-gray-800 text-gray-50 p-4 rounded-md overflow-auto mb-4 whitespace-pre-wrap break-words">
        {children}
      </pre>
    ),
    code: ({className, children}: MarkdownComponentProps) => {
      const match = /language-(\w+)/.exec(className || '');
      
      // 코드 블록인 경우 특수 토큰을 적절히 변환
      if (match && typeof children === 'string') {
        // ReactMarkdown이 코드 블록 내용을 처리할 때 특수 토큰 변환
        // __DOUBLE_BACKSLASH_N__를 \n으로 변환하여 화면에 표시
        const finalContent = children.replace(/__DOUBLE_BACKSLASH_N__/g, '\\n');
        
        // 디버깅용 콘솔 출력 - 개발 환경에서만 활성화
        if (process.env.NODE_ENV === 'development') {
          console.log('ProblemLayout code block with language:', match[1]);
          console.log('ProblemLayout code block content:', finalContent);
        }
        
        return <code className={`${className} text-gray-50`}>{finalContent}</code>;
      }
      
      return match ? (
        <code className={`${className} text-gray-50`}>{children}</code>
      ) : (
        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
      );
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4" style={{ backgroundColor: themeColors.bgLight }}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="py-6 px-6 text-white" style={{ 
          backgroundColor: themeColors.accent || themeColors.bg,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <Link
            to={`/${difficultyPath}/${categoryPath}`}
            className="text-white hover:underline inline-flex items-center"
          >
            <Icon iconId="chevron-left" className="mr-1 h-5 w-5" />
            {category} 카테고리로 돌아가기
          </Link>
          <h1 
            className="text-3xl font-bold mt-2 text-white"
          >
            {title}
          </h1>
          <div className="flex flex-wrap space-x-2 mt-2">
            <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
              {difficulty}
            </span>
            <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
              {category}
            </span>
            <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full">
              {isRequired ? '필수 문제' : '선택 문제'}
            </span>
          </div>
        </div>

        {moduleDescription && (
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">모듈 설명</h2>
            <div className="prose max-w-none p-4 rounded-lg whitespace-pre-wrap" style={{ backgroundColor: `${themeColors.bgLight}80` }}>
              <ReactMarkdown
                remarkPlugins={[remarkBreaks, remarkGfm]}
                components={markdownComponents}
              >
                {moduleDescription}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">문제 설명</h2>
          <div className="prose max-w-none mdx-content">{children}</div>
        </div>

        {ojLink && (
          <div className="p-6 border-b">
            <a 
              href={ojLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full block text-center py-3 px-4 rounded-md text-white font-medium hover:bg-opacity-90 transition-colors"
              style={{ backgroundColor: themeColors.accent || themeColors.bg }}
            >
              <div className="flex items-center justify-center">
                <Icon iconId="external-link" className="h-5 w-5 mr-2" />
                문제 풀러가기
              </div>
            </a>
          </div>
        )}

        {solutionIdea && (
          <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">풀이 아이디어</h2>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="hover:underline flex items-center"
                style={{ color: themeColors.text }}
              >
                {showSolution ? (
                  <>
                    <Icon iconId="eye" className="mr-1 h-5 w-5" />
                    숨기기
                  </>
                ) : (
                  <>
                    <Icon iconId="eye-off" className="mr-1 h-5 w-5" />
                    보기
                  </>
                )}
              </button>
            </div>

            {showSolution && (
              <div className="prose max-w-none p-4 rounded-lg whitespace-pre-wrap" style={{ backgroundColor: themeColors.bgLight }}>
                {typeof solutionIdea === "string" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks, remarkGfm]}
                    components={markdownComponents}
                  >
                    {solutionIdea}
                  </ReactMarkdown>
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
                <div className="p-4 rounded-lg" style={{ backgroundColor: themeColors.bgLight }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Python</h3>
                    <button
                      onClick={() => setShowPythonCode(!showPythonCode)}
                      className="hover:underline flex items-center text-sm"
                      style={{ color: themeColors.text }}
                    >
                      {showPythonCode ? (
                        <>
                          <Icon iconId="eye" className="mr-1 h-5 w-5" />
                          코드 숨기기
                        </>
                      ) : (
                        <>
                          <Icon iconId="eye-off" className="mr-1 h-5 w-5" />
                          코드 보기
                        </>
                      )}
                    </button>
                  </div>

                  {showPythonCode && (
                    <div className="code-block relative">
                      <span className="code-language-label">Python</span>
                      <button 
                        className="copy-button"
                        onClick={() => copyToClipboard(pythonCode, 'python')}
                      >
                        {copySuccess === 'python' ? '복사됨!' : '복사'}
                      </button>
                      <pre 
                        className="language-python whitespace-pre-wrap break-words overflow-auto mb-0 rounded-md p-4 bg-gray-800 text-gray-50" 
                        ref={pythonRef}
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          display: 'block'
                        }}
                      >
                        <code 
                          className="language-python whitespace-pre-wrap break-words"
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            display: 'block'
                          }}
                        >
                          {/* 코드 내용은 useEffect에서 처리 */}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {cppCode && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: themeColors.bgLight }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">C++</h3>
                    <button
                      onClick={() => setShowCppCode(!showCppCode)}
                      className="hover:underline flex items-center text-sm"
                      style={{ color: themeColors.text }}
                    >
                      {showCppCode ? (
                        <>
                          <Icon iconId="eye" className="mr-1 h-5 w-5" />
                          코드 숨기기
                        </>
                      ) : (
                        <>
                          <Icon iconId="eye-off" className="mr-1 h-5 w-5" />
                          코드 보기
                        </>
                      )}
                    </button>
                  </div>

                  {showCppCode && (
                    <div className="code-block relative">
                      <span className="code-language-label">C++</span>
                      <button 
                        className="copy-button"
                        onClick={() => copyToClipboard(cppCode, 'cpp')}
                      >
                        {copySuccess === 'cpp' ? '복사됨!' : '복사'}
                      </button>
                      <pre 
                        className="language-cpp whitespace-pre-wrap break-words overflow-auto mb-0 rounded-md p-4 bg-gray-800 text-gray-50" 
                        ref={cppRef}
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          display: 'block'
                        }}
                      >
                        <code 
                          className="language-cpp whitespace-pre-wrap break-words"
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            display: 'block'
                          }}
                        >
                          {/* 코드 내용은 useEffect에서 처리 */}
                        </code>
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
import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProblemLayout from "~/components/ProblemLayout";
import invariant from "tiny-invariant";
import { createServerClient } from '@supabase/ssr';
import type { Database } from "~/types/database.types";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { ReactNode, HTMLAttributes } from "react";

interface ProblemData {
  title: string;
  description: string;
  content: string;
  difficulty: string;
  difficultyName: string;
  category: string;
  categoryName: string;
  solutionIdea?: string;
  pythonCode?: string;
  cppCode?: string;
  is_required: boolean;
  module_order?: number | null;
  module_description?: string | null;
  oj_link?: string | null;
  colors: {
    bg: string;
    bgLight: string;
    hover: string;
    text: string;
    border: string;
    accent: string;
  };
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { difficulty, category, problem } = params;
  invariant(difficulty, "difficulty is required");
  invariant(category, "category is required");
  invariant(problem, "problem is required");

  // 환경 변수 설정 확인
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  }

  // Supabase 클라이언트 생성
  const cookieHeader = request.headers.get('Cookie') || '';
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(key) {
          return cookieHeader
            .split(';')
            .find(c => c.trim().startsWith(`${key}=`))
            ?.split('=')[1];
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(key, value, options) {
          // 이 함수는 필요하지만 SSR이므로 실제로는 사용되지 않음
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(key, options) {
          // 이 함수는 필요하지만 SSR이므로 실제로는 사용되지 않음
        },
      },
    }
  );

  try {
    // 난이도 정보 조회
    const { data: difficultyData, error: difficultyError } = await supabase
      .from('difficulties')
      .select('name, color_bg, color_bg_light, color_hover, color_text, color_border, color_accent')
      .eq('id', difficulty)
      .single();

    if (difficultyError) {
      throw new Error(`Error fetching difficulty info: ${difficultyError.message}`);
    }

    // 카테고리 정보 조회
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('title')
      .eq('id', category)
      .eq('difficulty_id', difficulty)
      .single();

    if (categoryError) {
      throw new Error(`Error fetching category info: ${categoryError.message}`);
    }

    // 문제 정보 조회 - 모든 필드를 가져옵니다
    const { data: problemData, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problem)
      .eq('category_id', category)
      .eq('difficulty_id', difficulty)
      .single();
      
    if (problemError) {
      throw new Error(`Problem data not found in database: ${problemError.message}`);
    }

    // 색상 정보 매핑
    const colors = {
      bg: difficultyData?.color_bg || '',
      bgLight: difficultyData?.color_bg_light || '',
      hover: difficultyData?.color_hover || '',
      text: difficultyData?.color_text || '',
      border: difficultyData?.color_border || '',
      accent: difficultyData?.color_accent || '',
    };

    // 내용에 실제 줄바꿈이 있는지 확인하고 처리
    // 코드 블록 외에만 \n으로 변환하도록 수정
    const processContent = (content: string): string => {
      // 디버깅을 위한 원본 내용 출력
      console.log('Original content:', content);
      
      // 코드 블록을 찾아서 임시 토큰으로 대체 (개선된 정규식 패턴)
      // 백틱 3개로 시작하고, 선택적인 언어 식별자, 그리고 코드 블록 내용
      const codeBlocks: string[] = [];
      const processedContent = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, codeContent) => {
        // 디버깅을 위한 코드 블록 출력
        console.log('Found code block with language:', language);
        console.log('Code content:', codeContent);
        
        // 코드 블록 내부의 처리:
        // 1. \\n -> 특수 토큰으로 변경하여 보존 (나중에 \n으로 표시하기 위함)
        // 2. \n은 그대로 유지 (실제 줄바꿈으로 렌더링됨)
        const preservedCode = codeContent.replace(/\\\\n/g, '__DOUBLE_BACKSLASH_N__');
        
        // 디버깅을 위한 변환된 코드 블록 출력
        console.log('Preserved code content:', preservedCode);
        
        // 전체 블록 재구성
        const preservedBlock = '```' + language + '\n' + preservedCode + '```';
        codeBlocks.push(preservedBlock);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
      });
      
      // 디버깅을 위한 코드 블록 제거 후 내용 출력
      console.log('Content after code block extraction:', processedContent);
      
      // 일반 텍스트에서 먼저 \\n을 특수 토큰으로 변환 (코드 블록 바깥에서도 \\n을 보존하기 위함)
      const preservedDoubleEscapes = processedContent.replace(/\\\\n/g, '__TEXT_DOUBLE_BACKSLASH_N__');
      
      // 그 다음 \n을 실제 줄바꿈으로 변환
      const convertedContent = preservedDoubleEscapes.replace(/\\n/g, '\n');
      
      // 특수 토큰을 다시 \\n으로 변환
      const restoredContent = convertedContent.replace(/__TEXT_DOUBLE_BACKSLASH_N__/g, '\\\\n');
      
      // 디버깅을 위한 \n 변환 후 내용 출력
      console.log('Content after escapes processing:', restoredContent);
      
      // 임시 토큰을 다시 코드 블록으로 변환
      const finalContent = restoredContent.replace(/__CODE_BLOCK_(\d+)__/g, (_, i) => {
        return codeBlocks[parseInt(i)];
      });
      
      // 디버깅을 위한 최종 내용 출력
      console.log('Final processed content:', finalContent);
      
      return finalContent;
    };

    // 코드 블록에 대한 처리 함수
    const processCodeBlock = (code: string | null): string => {
      if (!code) return '';
      
      console.log('Original code block:', code);
      
      // 현재는 코드를 그대로 유지하고 클라이언트에서 Prism으로 처리
      // 이스케이프된 \n은 클라이언트에서 변환
      return code;
    };

    const formattedContent = problemData.content ? processContent(problemData.content) : '';
    const formattedSolutionIdea = problemData.solution_idea ? processContent(problemData.solution_idea) : '';
    const formattedModuleDescription = problemData.module_description ? processContent(problemData.module_description) : null;
    const formattedPythonCode = processCodeBlock(problemData.python_code);
    const formattedCppCode = processCodeBlock(problemData.cpp_code);

    return json({
      title: problemData.title,
      description: problemData.description,
      content: formattedContent,
      difficulty,
      difficultyName: difficultyData?.name || difficulty,
      category,
      categoryName: categoryData?.title || category,
      problemId: problem,
      solutionIdea: formattedSolutionIdea,
      pythonCode: formattedPythonCode,
      cppCode: formattedCppCode,
      is_required: problemData.is_required || false,
      module_order: problemData.module_order || null,
      module_description: formattedModuleDescription,
      oj_link: problemData.oj_link || null,
      colors,
    } as ProblemData);
  } catch (error) {
    console.error("Error loading problem:", error);
    throw new Response("Problem not found", { status: 404 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "문제를 찾을 수 없습니다 - 알고매직(Algomagic)" },
      { name: "description", content: "요청하신 문제를 찾을 수 없습니다." },
    ];
  }

  return [
    { title: `${data.title} - 알고매직(Algomagic)` },
    { name: "description", content: data.description },
  ];
};

export default function ProblemRoute() {
  const data = useLoaderData<typeof loader>();

  // 마크다운 컴포넌트 타입 정의
  interface MarkdownComponentProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
  }

  // 마크다운 컴포넌트 설정
  const markdownComponents = {
    h1: ({ children, ...props }: MarkdownComponentProps) => (
      <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: MarkdownComponentProps) => (
      <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: MarkdownComponentProps) => (
      <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>
    ),
    p: ({ children, ...props }: MarkdownComponentProps) => (
      <p className="mb-4 whitespace-pre-wrap" {...props}>{children}</p>
    ),
    ul: ({ children, ...props }: MarkdownComponentProps) => (
      <ul className="list-disc pl-5 mb-4 space-y-1" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: MarkdownComponentProps) => (
      <ol className="list-decimal pl-5 mb-4 space-y-1" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: MarkdownComponentProps) => (
      <li className="mb-1" {...props}>{children}</li>
    ),
    table: ({ children, ...props }: MarkdownComponentProps) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-gray-300" {...props}>{children}</table>
      </div>
    ),
    thead: ({ children, ...props }: MarkdownComponentProps) => (
      <thead className="bg-gray-100" {...props}>{children}</thead>
    ),
    tbody: ({ children, ...props }: MarkdownComponentProps) => (
      <tbody className="divide-y divide-gray-300" {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: MarkdownComponentProps) => (
      <tr className="divide-x divide-gray-300" {...props}>{children}</tr>
    ),
    th: ({ children, ...props }: MarkdownComponentProps) => (
      <th className="px-4 py-2 text-left font-semibold border border-gray-300" {...props}>{children}</th>
    ),
    td: ({ children, ...props }: MarkdownComponentProps) => (
      <td className="px-4 py-2 border border-gray-300" {...props}>{children}</td>
    ),
    pre: ({ children }: MarkdownComponentProps) => (
      <pre className="bg-gray-800 text-gray-50 p-4 rounded-md overflow-auto mb-4 whitespace-pre-wrap break-words">
        {children}
      </pre>
    ),
    code: ({ className, children }: MarkdownComponentProps) => {
      const match = /language-(\w+)/.exec(className || '');
      
      // 코드 블록인 경우 특수 토큰을 적절히 변환
      if (match && typeof children === 'string') {
        // ReactMarkdown이 코드 블록 내용을 처리할 때 특수 토큰 변환
        // __DOUBLE_BACKSLASH_N__를 \n으로 변환하여 화면에 표시
        const finalContent = children.replace(/__DOUBLE_BACKSLASH_N__/g, '\\n');
        
        // 디버깅용 콘솔 출력 - 개발 환경에서만 활성화
        if (process.env.NODE_ENV === 'development') {
          console.log('Code block with language:', match[1]);
          console.log('Code block content before rendering:', finalContent);
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
    <ProblemLayout
      title={data.title}
      difficulty={data.difficultyName}
      category={data.categoryName}
      categoryPath={data.category}
      solutionIdea={data.solutionIdea}
      pythonCode={data.pythonCode}
      cppCode={data.cppCode}
      colors={data.colors}
      isRequired={data.is_required}
      moduleOrder={data.module_order}
      moduleDescription={data.module_description}
      ojLink={data.oj_link}
    >
      <div className="markdown-content whitespace-pre-wrap">
        <ReactMarkdown 
          remarkPlugins={[remarkBreaks, remarkGfm]} 
          components={markdownComponents}
        >
          {data.content}
        </ReactMarkdown>
      </div>
    </ProblemLayout>
  );
} 
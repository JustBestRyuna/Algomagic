import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import * as fs from "fs/promises";
import * as path from "path";
import { createServerClient } from '@supabase/ssr';
import type { Database } from "~/types/database.types";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  is_required: boolean;
  module_order: number | null;
  module_description: string | null;
}

interface DifficultyData {
  name: string;
  color_bg_light: string;
  color_hover: string;
  color_text: string;
  color_border: string;
}

interface CategoryData {
  title: string;
  description: string;
  short_description?: string;
}

interface LoaderData {
  problems: Problem[];
  difficulty: string;
  category: string;
  difficultyName: string;
  categoryName: string;
  categoryDescription: string;
  colors: {
    bg: string;
    hover: string;
    text: string;
    border: string;
  };
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { difficulty, category } = params;
  invariant(difficulty, "difficulty is required");
  invariant(category, "category is required");

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
        set(_key, _value, _options) {
          // 이 함수는 필요하지만 SSR이므로 실제로는 사용되지 않음
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_key, _options) {
          // 이 함수는 필요하지만 SSR이므로 실제로는 사용되지 않음
        },
      },
    }
  );

  try {
    // 난이도 정보 조회
    const { data: difficultyData, error: difficultyError } = await supabase
      .from('difficulties')
      .select('name, color_bg_light, color_hover, color_text, color_border')
      .eq('id', difficulty)
      .single();

    if (difficultyError) {
      throw new Error(`Error fetching difficulty: ${difficultyError.message}`);
    }

    // 카테고리 정보 조회
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('title, description, short_description')
      .eq('id', category)
      .eq('difficulty_id', difficulty)
      .single();

    if (categoryError) {
      throw new Error(`Error fetching category: ${categoryError.message}`);
    }

    // content 디렉토리에서 해당 난이도와 카테고리의 문제 목록을 가져오는 로직
    // 실제 구현에서는 파일 시스템이나 DB에서 데이터를 가져올 수 있음
    const problemsDir = path.join(
      process.cwd(),
      "content",
      "problems",
      difficulty,
      category
    );
    
    let problems: Problem[] = [];
    
    // 디렉토리 존재 여부 확인
    try {
      await fs.access(problemsDir);
      
      // 디렉토리에서 mdx 파일 목록 가져오기
      const files = await fs.readdir(problemsDir);
      const mdxFiles = files.filter(file => file.endsWith('.mdx'));
      
      // 각 MDX 파일에서 프론트매터 읽기
      problems = await Promise.all(
        mdxFiles.map(async (file) => {
          const filePath = path.join(problemsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // 간단한 프론트매터 파싱 (실제로는 더 정교한 파싱 로직이 필요할 수 있음)
          const titleMatch = content.match(/title:\s*["'](.+?)["']/);
          const descriptionMatch = content.match(/description:\s*["'](.+?)["']/);
          const difficultyMatch = content.match(/difficulty:\s*["'](.+?)["']/);
          
          return {
            id: file.replace('.mdx', ''),
            title: titleMatch ? titleMatch[1] : '제목 없음',
            description: descriptionMatch ? descriptionMatch[1] : '설명 없음',
            difficulty: difficultyMatch ? difficultyMatch[1] : '난이도 미정',
            is_required: false,
            module_order: null,
            module_description: null,
          };
        })
      );
    } catch (error) {
      // 디렉토리가 없으면 빈 문제 목록 반환
      console.warn(`Problems directory not found: ${problemsDir}, ${error}`);
    }

    // Supabase에서도 문제 목록 가져오기 (우선순위 높음)
    const { data: problemsData, error: problemsError } = await supabase
      .from('problems')
      .select('id, title, description, is_required, module_order, module_description')
      .eq('category_id', category)
      .eq('difficulty_id', difficulty)
      .order('order_num');

    if (problemsError) {
      console.error(`Error fetching problems from database: ${problemsError.message}`);
    } else if (problemsData && problemsData.length > 0) {
      // 데이터베이스에서 가져온 문제 목록이 있으면 사용
      problems = problemsData.map((problem) => ({
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: difficultyData?.name || difficulty,
        is_required: problem.is_required || false,
        module_order: problem.module_order,
        module_description: problem.module_description,
      }));
    }

    const diffInfo = difficultyData as DifficultyData;
    const catInfo = categoryData as CategoryData;

    return json({
      problems,
      difficulty,
      category,
      difficultyName: diffInfo.name || difficulty,
      categoryName: catInfo.title || category,
      categoryDescription: catInfo.description || '',
      colors: {
        bg: diffInfo.color_bg_light || 'bg-gray-50',
        hover: diffInfo.color_hover || 'hover:bg-gray-100',
        text: diffInfo.color_text || 'text-gray-700',
        border: diffInfo.color_border || 'border-gray-200',
      },
    } as LoaderData);
  } catch (error) {
    console.error("Error loading problems:", error);
    throw new Response("Problems not found", { status: 404 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "문제를 찾을 수 없습니다 - 알고매직(Algomagic)" },
      { name: "description", content: "요청하신 문제 목록을 찾을 수 없습니다." },
    ];
  }

  return [
    { title: `${data.categoryName} 문제 모음 - 알고매직(Algomagic)` },
    { name: "description", content: `프로그래밍 언어로 ${data.categoryName}하는 방법을 배우는 문제 모음` },
  ];
};

export default function CategoryIndex() {
  const data = useLoaderData<typeof loader>();
  const { problems, difficulty, category, difficultyName, categoryName, categoryDescription, colors } = data;

  // 문제들을 모듈별로 그룹화
  const problemsByModule = problems.reduce((acc, problem) => {
    // 모듈 번호가 없으면 null 모듈로 처리
    const moduleKey = problem.module_order !== null ? problem.module_order : 'none';
    
    if (!acc[moduleKey]) {
      acc[moduleKey] = {
        order: problem.module_order,
        description: problem.module_description,
        problems: []
      };
    }
    
    // 모듈 설명이 없고 현재 문제에 모듈 설명이 있으면 추가
    if (!acc[moduleKey].description && problem.module_description) {
      acc[moduleKey].description = problem.module_description;
    }
    
    acc[moduleKey].problems.push(problem);
    return acc;
  }, {} as Record<string | number, { 
    order: number | null, 
    description: string | null, 
    problems: Problem[] 
  }>);
  
  // 모듈 순서에 따라 정렬
  const sortedModules = Object.entries(problemsByModule)
    .filter(([key]) => key !== 'none')
    .sort(([, moduleA], [, moduleB]) => {
      if (moduleA.order === null) return 1;
      if (moduleB.order === null) return -1;
      return moduleA.order - moduleB.order;
    });
  
  // 모듈이 없는 문제들은 맨 아래에 표시
  const nonModuleProblems = problemsByModule['none']?.problems || [];

  return (
    <div className="px-4 py-12 mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          to={`/${difficulty}`}
          className="hover:underline mb-4 inline-block"
          style={{ color: colors.text }}
        >
          ← {difficultyName} 난이도로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mt-2">{categoryName} 문제 모음</h1>
        <p className="mt-2 text-gray-600">
          {categoryDescription}
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">아직 등록된 문제가 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 모듈별 문제 목록 */}
          {sortedModules.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-black">학습 모듈</h2>
              <p className="mb-4 text-gray-600">모듈별로 정리된 학습 문제들입니다. 순서대로 풀어보세요.</p>
              <div className="space-y-8">
                {sortedModules.map(([key, moduleData], moduleIndex) => (
                  <div key={key} className="rounded-lg overflow-hidden shadow-md border" style={{ borderColor: colors.border }}>
                    {moduleData.description && (
                      <div className="p-4 border-b" style={{ backgroundColor: `${colors.bg}22`, borderColor: colors.border }}>
                        <h3 className="text-xl font-semibold">모듈 {moduleData.order || moduleIndex + 1}</h3>
                      </div>
                    )}
                    <div className="divide-y" style={{ borderColor: colors.border }}>
                      {moduleData.problems
                        .sort((a, b) => {
                          // 필수 문제를 먼저 보여주고, 그 다음 선택 문제 보여주기
                          if (a.is_required && !b.is_required) return -1;
                          if (!a.is_required && b.is_required) return 1;
                          return 0;
                        })
                        .map((problem) => (
                          <Link
                            key={problem.id}
                            to={`/${difficulty}/${category}/${problem.id}`}
                            className="block p-5 hover:shadow-lg transition"
                            style={{ 
                              background: problem.is_required
                                ? `linear-gradient(to bottom, ${colors.text}, ${colors.text}ee)`
                                : `linear-gradient(to bottom, ${colors.text}dd, ${colors.text}cc)`,
                              transition: "all 0.2s"
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h2 className="text-xl font-semibold text-white">
                                  {problem.title}
                                </h2>
                                <p className="text-white/80 mt-1">{problem.description}</p>
                              </div>
                              <span className="text-sm px-2 py-1 rounded border text-white" 
                                style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                                {problem.is_required ? '필수' : '선택'}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 모듈이 지정되지 않은 문제들 */}
          {nonModuleProblems.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-black">기타 문제</h2>
              <p className="mb-4 text-gray-600">모듈에 속하지 않은 추가 학습 문제들입니다.</p>
              <div className="space-y-4">
                {nonModuleProblems.map((problem) => (
                  <Link
                    key={problem.id}
                    to={`/${difficulty}/${category}/${problem.id}`}
                    className="block p-5 rounded-lg shadow-sm hover:shadow-md transition border"
                    style={{ 
                      background: problem.is_required
                        ? `linear-gradient(to bottom, ${colors.text}, ${colors.text}ee)`
                        : `linear-gradient(to bottom, ${colors.text}dd, ${colors.text}cc)`,
                      borderColor: colors.border,
                      transition: "all 0.2s"
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-white">{problem.title}</h2>
                        <p className="text-white/80 mt-1">{problem.description}</p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded border text-white" 
                        style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                        {problem.is_required ? '필수' : '선택'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
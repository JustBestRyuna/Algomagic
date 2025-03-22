import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { createServerClient } from '@supabase/ssr';
import type { Database } from "~/types/database.types";

// 카테고리 아이콘 컴포넌트
const CategoryIcon = ({ svgPath }: { svgPath: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
    </svg>
  );
};

interface CategoryData {
  id: string;
  title: string;
  description: string;
  iconId: string;
  svgPath: string;
  problems: {
    id: string;
    title: string;
  }[];
}

interface DifficultyColors {
  bg: string;
  bgLight: string;
  hover: string;
  text: string;
  border: string;
  accent: string;
}

interface LoaderData {
  difficulty: string;
  difficultyName: string;
  description: {
    short: string;
    long: string;
  };
  categories: CategoryData[];
  colors: DifficultyColors;
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { difficulty } = params;
  invariant(difficulty, "difficulty is required");

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
      .select('*')
      .eq('id', difficulty)
      .single();

    if (difficultyError) {
      throw new Error(`Error fetching difficulty: ${difficultyError.message}`);
    }

    if (!difficultyData) {
      throw new Response("Difficulty not found", { status: 404 });
    }

    // 카테고리 정보 조회
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id, 
        title, 
        description, 
        icon_id,
        icons:icon_id(svg_path)
      `)
      .eq('difficulty_id', difficulty)
      .order('order_num');

    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }

    // 각 카테고리별 문제 목록 조회
    const categoriesWithProblems = await Promise.all(
      (categoriesData || []).map(async (category) => {
        const { data: problemsData, error: problemsError } = await supabase
          .from('problems')
          .select('id, title')
          .eq('category_id', category.id)
          .eq('difficulty_id', difficulty)
          .order('order_num');

        if (problemsError) {
          throw new Error(`Error fetching problems for category ${category.id}: ${problemsError.message}`);
        }

        // icons 객체가 배열이 아닌 단일 객체로 가정하고 처리
        let svgPath = '';
        if (category.icons && typeof category.icons === 'object' && 'svg_path' in category.icons) {
          svgPath = String(category.icons.svg_path);
        }

        return {
          id: category.id,
          title: category.title,
          description: category.description,
          iconId: category.icon_id,
          svgPath,
          problems: problemsData || [],
        };
      })
    );

    // 색상 정보 매핑
    const colors: DifficultyColors = {
      bg: difficultyData.color_bg,
      bgLight: difficultyData.color_bg_light,
      hover: difficultyData.color_hover,
      text: difficultyData.color_text,
      border: difficultyData.color_border,
      accent: difficultyData.color_accent,
    };

    // 난이도 설명 매핑
    const description = {
      short: difficultyData.short_description,
      long: difficultyData.long_description,
    };

    return json({
      difficulty,
      difficultyName: difficultyData.name,
      description,
      categories: categoriesWithProblems,
      colors,
    } as LoaderData);
  } catch (error) {
    console.error("Error loading difficulty data:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Error loading difficulty data", { status: 500 });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      { title: "난이도를 찾을 수 없습니다 - 알고매직(Algomagic)" },
      { name: "description", content: "요청하신 난이도를 찾을 수 없습니다." },
    ];
  }

  return [
    { title: `${data.difficultyName} 난이도 - 알고매직(Algomagic)` },
    { name: "description", content: data.description.short },
  ];
};

export default function DifficultyIndex() {
  const data = useLoaderData<typeof loader>();
  const { difficulty, difficultyName, description, categories, colors } = data;

  return (
    <div className={`${colors.bgLight} min-h-screen pb-16`}>
      <div className={`${colors.bg} text-white`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{difficultyName} 난이도</h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              {description.long.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < description.long.split('\n').length - 1 && (
                    <br className="hidden sm:inline" />
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md border ${colors.border}`}
            >
              <div className="px-6 py-6">
                <div className="flex items-center mb-4">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-md ${colors.bg} text-white p-3`}>
                    <CategoryIcon svgPath={category.svgPath} />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-semibold text-gray-900">{category.title}</h2>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{category.description}</p>
                
                <div className={`border-t ${colors.border} pt-4`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">문제 목록:</h3>
                  <ul className="space-y-2 mb-6">
                    {category.problems.map((problem) => (
                      <li key={problem.id} className="flex items-start">
                        <svg className={`flex-shrink-0 mt-1 mr-2 h-5 w-5 ${colors.text}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <Link 
                          to={`/${difficulty}/${category.id}/${problem.id}`}
                          className={`${colors.text} hover:underline hover:text-${difficulty}-800 font-medium`}
                          style={{ color: colors.accent }}
                        >
                          {problem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-2">
                  <Link 
                    to={`/${difficulty}/${category.id}`} 
                    className={`inline-flex items-center ${colors.text} hover:text-${difficulty}-800 font-medium`}
                  >
                    {category.title} 모든 문제 보기
                    <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 10a.75.75 0 0 1 .75-.75h12.59l-2.1-1.95a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.1-1.95H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
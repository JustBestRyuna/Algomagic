import { MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { supabase } from "~/utils/supabase.server";
import { Difficulty } from "~/root";
import Icon from "~/components/IconLibrary";

interface LoaderData {
  difficulties: Difficulty[];
}

export const loader = async () => {
  // 모든 난이도 정보 가져오기
  const { data: difficulties, error: difficultiesError } = await supabase
    .from('difficulties')
    .select('id, name, short_description, long_description, color_bg, color_bg_light, color_hover, color_text, color_border, color_accent');

  if (difficultiesError) {
    console.error("난이도 정보를 가져오는데 실패했습니다:", difficultiesError);
    return json({ difficulties: [] });
  }

  // 수동으로 정의한 난이도 순서
  const difficultyOrder = {
    'tutorial': 0,
    'bronze': 1, 
    'silver': 2,
    'gold': 3,
    'platinum': 4,
    'diamond': 5,
    'ruby': 6
  };

  // 각 난이도별 카테고리 수 확인
  const difficultiesWithCategories = await Promise.all(
    difficulties.map(async (difficulty) => {
      const { count, error: countError } = await supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .eq('difficulty_id', difficulty.id);
      
      if (countError) {
        console.error(`${difficulty.id} 난이도의 카테고리 수를 가져오는데 실패했습니다:`, countError);
        return { 
          ...difficulty, 
          categoryCount: 0, 
          display_name: difficulty.name,
          description: difficulty.short_description,
          orderIndex: difficultyOrder[difficulty.id as keyof typeof difficultyOrder]
        };
      }
      
      return { 
        ...difficulty, 
        categoryCount: count || 0, 
        display_name: difficulty.name,
        description: difficulty.short_description,
        orderIndex: difficultyOrder[difficulty.id as keyof typeof difficultyOrder]
      };
    })
  );

  // 난이도 순서대로 정렬
  const sortedDifficulties = difficultiesWithCategories.sort((a, b) => a.orderIndex - b.orderIndex);

  return json({ difficulties: sortedDifficulties });
};

export const meta: MetaFunction = () => {
  return [
    { title: "알고매직(Algomagic) - 알고리즘 문제풀이 가이드" },
    { name: "description", content: "알고리즘 문제풀이 가이드를 제공하는 웹서비스" },
  ];
};

export default function Index() {
  const { difficulties } = useLoaderData<LoaderData>();
  
  // 첫 두 개 난이도를 메인 버튼으로 표시
  const mainDifficulties = difficulties.slice(0, 2);
  
  return (
    <div>
      {/* 히어로 섹션 */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">알고리즘 학습의 새로운 방법</span>
              <span className="block text-indigo-600">알고매직</span>
            </h1>
            <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              여러 온라인 저지(OJ)의 문제들을 분석하여 알고리즘별·난이도별로 정리된 가이드를 제공합니다.
              쉽고 친절한 설명과 풀이 아이디어로 알고리즘 학습을 도와드립니다.
            </p>
            <div className="max-w-md mx-auto mt-5 sm:flex sm:justify-center md:mt-8">
              {mainDifficulties.map((difficulty, index) => (
                <div key={difficulty.id} className={index === 0 ? "rounded-md shadow" : "mt-3 rounded-md shadow sm:mt-0 sm:ml-3"}>
                  <Link
                    to={`/${difficulty.id}`}
                    className={`flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white border border-transparent rounded-md md:py-4 md:text-lg md:px-10`}
                    style={{ 
                      backgroundColor: difficulty.color_text || '#16a34a',
                      color: 'white' 
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = difficulty.color_accent || '#15803d';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = difficulty.color_text || '#16a34a';
                    }}
                  >
                    {index === 0 ? `${difficulty.display_name || difficulty.name} 시작하기` : `${difficulty.display_name || difficulty.name} 문제 풀기`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 특징 섹션 */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">알고매직 특징</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              알고리즘 학습을 더 효과적으로
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              알고매직은 초보자부터 상급자까지 누구나 쉽게 알고리즘을 배울 수 있도록 설계되었습니다.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div 
                  className="absolute flex items-center justify-center h-12 w-12 rounded-md text-white"
                  style={{ backgroundColor: difficulties[0]?.color_accent || '#16a34a' }}
                >
                  <Icon iconId="academic-cap" className="w-6 h-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">단계별 학습</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {difficulties.length > 0 ? `${difficulties[0]?.display_name} 단계부터 ${difficulties[difficulties.length - 1]?.display_name} 난이도까지` : '다양한 난이도에 따라'}, 체계적으로 알고리즘 개념을 학습할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div 
                  className="absolute flex items-center justify-center h-12 w-12 rounded-md text-white"
                  style={{ backgroundColor: difficulties[1]?.color_accent || '#a84117' }}
                >
                  <Icon iconId="sparkles" className="w-6 h-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">상세한 풀이 가이드</h3>
                  <p className="mt-2 text-base text-gray-500">
                    각 문제마다 친절한 설명과 풀이 아이디어를 제공하여 혼자서도 학습이 가능합니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div 
                  className="absolute flex items-center justify-center h-12 w-12 rounded-md text-white"
                  style={{ backgroundColor: difficulties[0]?.color_accent || '#16a34a' }}
                >
                  <Icon iconId="cursor-click" className="w-6 h-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">인터랙티브 학습</h3>
                  <p className="mt-2 text-base text-gray-500">
                    일부 문제에는 알고리즘 이해를 돕는 상호작용 컴포넌트가 포함되어 있어 직접 체험하며 학습할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 난이도 섹션 */}
      <div className="bg-gray-50 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
            난이도별 학습 가이드
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {difficulties.map((difficulty) => (
              <div 
                key={difficulty.id}
                className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg"
                style={{ borderColor: difficulty.color_border || '#bbf7d0', borderWidth: '1px' }}
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div 
                      className="flex-shrink-0 rounded-md p-3 text-white"
                      style={{ backgroundColor: difficulty.color_accent || '#16a34a' }}
                    >
                      <Icon iconId="light-bulb" className="w-6 h-6" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-2xl font-bold text-gray-900">{difficulty.display_name || difficulty.name} 난이도</h3>
                      <p className="mt-2 text-base text-gray-500">
                        {difficulty.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="px-4 py-4 sm:px-6"
                  style={{ backgroundColor: difficulty.color_bg_light || '#f0fdf4' }}
                >
                  <div className="text-sm">
                    <Link 
                      to={`/${difficulty.id}`} 
                      style={{ color: difficulty.color_accent || '#15803d' }}
                      className="font-medium hover:underline"
                    >
                      {difficulty.display_name || difficulty.name} {difficulty.id === 'tutorial' ? '시작하기' : '문제 풀어보기'}<span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

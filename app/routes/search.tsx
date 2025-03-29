import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { supabase } from "~/utils/supabase.server";
import { Search } from "~/components/Search";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty_id: string;
  category_id: string;
  difficulty: {
    name: string;
    color_text: string;
    color_bg: string;
    color_border: string;
  };
  category: {
    title: string;
  };
}

interface LoaderData {
  problems: Problem[];
  query: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  // 검색어가 없으면 빈 결과 반환
  if (!query) {
    return json({ problems: [], query });
  }

  // 문제 제목으로 검색
  const { data: problems, error } = await supabase
    .from("problems")
    .select(`
      id, 
      title, 
      description, 
      difficulty_id, 
      category_id,
      difficulty:difficulty_id (name, color_text, color_bg, color_border),
      category:category_id (title)
    `)
    .ilike("title", `%${query}%`)
    .order("title");

  if (error) {
    console.error("문제 검색 중 오류 발생:", error);
    return json({ problems: [], query, error: "문제 검색 중 오류가 발생했습니다." });
  }

  return json({ problems: problems || [], query });
};

export default function SearchPage() {
  const { problems } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") || "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">문제 검색</h1>
      
      <div className="mb-6">
        <Search className="max-w-xl" />
      </div>
      
      {currentQuery && (
        <p className="text-gray-600 mb-4">
          &quot;{currentQuery}&quot; 검색 결과: {problems.length}개의 문제를 찾았습니다.
        </p>
      )}

      {problems.length > 0 ? (
        <div className="space-y-4">
          {problems.map((problem) => (
            <div 
              key={problem.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: problem.difficulty.color_border }}
            >
              <Link 
                to={`/${problem.difficulty_id}/${problem.category_id}/${problem.id}`}
                className="block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="text-xs px-2 py-1 rounded font-semibold"
                    style={{ 
                      backgroundColor: problem.difficulty.color_bg,
                      color: problem.difficulty.color_text
                    }}
                  >
                    {problem.difficulty.name}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {problem.category.title}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {problem.title}
                </h2>
                <p className="text-gray-700 line-clamp-2">
                  {problem.description}
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : currentQuery ? (
        <div className="py-10 text-center">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-gray-500">다른 검색어로 시도해보세요.</p>
        </div>
      ) : null}
    </div>
  );
} 
import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProblemLayout from "~/components/ProblemLayout";
import invariant from "tiny-invariant";
import * as fs from "fs/promises";
import * as path from "path";
import { getMDXComponent } from "mdx-bundler/client";
import { bundleMDX } from "mdx-bundler";
import { useMemo } from "react";
import { createServerClient } from '@supabase/ssr';
import type { Database } from "~/types/database.types";

interface ProblemData {
  title: string;
  description: string;
  difficulty: string;
  difficultyName: string;
  category: string;
  categoryName: string;
  solutionIdea?: string;
  pythonCode?: string;
  cppCode?: string;
  mdxSource: string;
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
      .select('name')
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

    // MDX 파일 경로
    const mdxPath = path.join(
      process.cwd(),
      "content",
      "problems",
      difficulty,
      category,
      `${problem}.mdx`
    );

    // MDX 파일 읽기
    const source = await fs.readFile(mdxPath, "utf-8");
    
    // MDX 파일 번들링
    const { code, frontmatter } = await bundleMDX({
      source,
      cwd: path.dirname(mdxPath),
    });

    // frontmatter에서 필수 필드 확인
    const title = frontmatter.title || '제목 없음';
    const description = frontmatter.description || '설명 없음';

    return json({
      mdxSource: code,
      ...frontmatter,
      title,
      description,
      difficulty,
      difficultyName: difficultyData?.name || difficulty,
      category,
      categoryName: categoryData?.title || category,
      problemId: problem,
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
  const MDXContent = useMemo(() => getMDXComponent(data.mdxSource), [data.mdxSource]);

  return (
    <ProblemLayout
      title={data.title}
      difficulty={data.difficultyName}
      category={data.categoryName}
      categoryPath={data.category}
      solutionIdea={data.solutionIdea}
      pythonCode={data.pythonCode}
      cppCode={data.cppCode}
    >
      <MDXContent />
    </ProblemLayout>
  );
} 
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { useEffect } from "react";
import { supabase } from "~/utils/supabase.server";

import "./tailwind.css";
import "./styles/mdx.css";
import "./styles/prism.css";
import 'katex/dist/katex.min.css';

export const links: LinksFunction = () => [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
  },
];

// Google Analytics 스크립트
function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // 페이지 뷰 측정
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag("event", "page_view", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

// 난이도 타입 정의
export interface Difficulty {
  id: string;
  name: string;
  color_bg: string;
  color_bg_light: string;
  color_hover: string;
  color_text: string;
  color_border: string;
  color_accent: string;
  categoryCount: number;
  orderIndex: number;
  display_name: string;
  description?: string;
  short_description?: string;
  long_description?: string;
}

// 루트 로더에서 난이도 정보를 가져오는 함수 추가
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
          orderIndex: difficultyOrder[difficulty.id as keyof typeof difficultyOrder] || 999
        };
      }

      return {
        ...difficulty,
        categoryCount: count || 0,
        display_name: difficulty.name,
        description: difficulty.short_description,
        orderIndex: difficultyOrder[difficulty.id as keyof typeof difficultyOrder] || 999
      };
    })
  );

  // 난이도 순서대로 정렬
  const sortedDifficulties = difficultiesWithCategories.sort((a, b) => a.orderIndex - b.orderIndex);

  return json({ difficulties: sortedDifficulties as unknown as Difficulty[] });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body className="h-full">
    {children}
    <GoogleAnalytics />
    <ScrollRestoration />
    <Scripts />
    </body>
    </html>
  );
}

export default function App() {
  const { difficulties } = useLoaderData<typeof loader>();

  return (
    <html lang="ko" className="h-full">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body className="h-full">
    <div className="flex flex-col min-h-screen">
      <Navigation difficulties={difficulties} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>

    <GoogleAnalytics />
    <ScrollRestoration />
    <Scripts />
    </body>
    </html>
  );
}

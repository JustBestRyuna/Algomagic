import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { useEffect } from "react";

import "./tailwind.css";
import "./styles/mdx.css";
import "./styles/prism.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
  },
];

// MDX 파일 내의 코드 블록에 하이라이팅 적용을 위한 클라이언트 측 코드
function ClientMarkdownPrism() {
  const location = useLocation();

  useEffect(() => {
    async function highlightCodeBlocks() {
      // 동적으로 Prism.js 불러오기
      const Prism = await import("prismjs");
      await import("prismjs/components/prism-python");
      await import("prismjs/components/prism-cpp");

      // MDX 콘텐츠 내의 코드 블록에 하이라이팅 적용
      Prism.default.highlightAll();
    }

    highlightCodeBlocks();
  }, [location]);

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <ClientMarkdownPrism />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

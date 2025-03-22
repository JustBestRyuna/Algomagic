import { useEffect, useRef } from "react";
import Prism from "prismjs";

interface CodeHighlightProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export function CodeHighlight({ code, language, showLineNumbers = false }: CodeHighlightProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const languageClass = `language-${language}`;
  const lineNumbersClass = showLineNumbers ? "line-numbers" : "";

  return (
    <div className="code-block">
      <span className="code-language-label">{language.toUpperCase()}</span>
      <pre className={lineNumbersClass}>
        <code ref={codeRef} className={languageClass}>
          {code}
        </code>
      </pre>
    </div>
  );
} 
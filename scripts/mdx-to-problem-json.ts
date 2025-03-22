import * as fs from 'fs';
import * as path from 'path';

/**
 * MDX 파일에서 문제 JSON을 생성하는 스크립트
 * 
 * 사용법: ts-node scripts/mdx-to-problem-json.ts <MDX 파일 경로>
 * 예시: ts-node scripts/mdx-to-problem-json.ts ./content/problems/tutorial/output/hello-world.mdx
 */

interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  order: number;
  content: string;
  solutionIdea: string;
  pythonCode: string;
  cppCode: string;
  input: string;
  output: string;
  examples: ProblemExample[];
  notes?: string;
}

// 커맨드 라인 인자 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('오류: MDX 파일 경로를 지정해주세요.');
  console.error('사용법: ts-node scripts/mdx-to-problem-json.ts <MDX 파일 경로>');
  process.exit(1);
}

const mdxFilePath = args[0];

// 파일 존재 확인
if (!fs.existsSync(mdxFilePath)) {
  console.error(`오류: 파일을 찾을 수 없습니다: ${mdxFilePath}`);
  process.exit(1);
}

// MDX에서 JSON 생성
try {
  // MDX 파일 읽기
  const mdxContent = fs.readFileSync(mdxFilePath, 'utf-8');
  
  // frontmatter 추출
  const frontmatterMatch = mdxContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.error('오류: frontmatter를 찾을 수 없습니다.');
    process.exit(1);
  }
  
  const frontmatter = frontmatterMatch[1];
  
  // 파일 경로에서 정보 추출
  const pathParts = mdxFilePath.split(path.sep);
  const fileName = path.basename(mdxFilePath, '.mdx');
  
  // 디렉토리 경로에서 난이도와 카테고리 추출
  let difficulty = 'tutorial';
  let category = 'output';
  
  // 디렉토리 구조: /path/to/content/problems/difficulty/category/filename.mdx
  const problemsIndex = pathParts.indexOf('problems');
  if (problemsIndex !== -1 && problemsIndex + 2 < pathParts.length) {
    difficulty = pathParts[problemsIndex + 1];
    category = pathParts[problemsIndex + 2];
  }
  
  // frontmatter에서 데이터 추출
  const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/);
  const descriptionMatch = frontmatter.match(/description:\s*["'](.+?)["']/);
  
  // 여러 줄 텍스트 추출 함수
  function extractMultilineText(content: string, key: string): string {
    const regex = new RegExp(`${key}:\\s*\\|\\n([\\s\\S]*?)(?:\\n\\w+:|$)`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }
  
  const solutionIdea = extractMultilineText(frontmatter, 'solutionIdea');
  const pythonCode = extractMultilineText(frontmatter, 'pythonCode');
  const cppCode = extractMultilineText(frontmatter, 'cppCode');
  
  // 본문 내용 추출
  const contentMatch = mdxContent.match(/---\n[\s\S]*?---\n\n([\s\S]*)/);
  const content = contentMatch ? contentMatch[1].trim() : '';
  
  // 문제, 입력, 출력, 예제 추출
  function extractSection(content: string, sectionName: string): string {
    const regex = new RegExp(`## ${sectionName}\\n\\n([\\s\\S]*?)(?:\\n##|$)`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }
  
  const input = extractSection(content, '입력');
  const output = extractSection(content, '출력');
  const notes = extractSection(content, '노트');
  
  // 예제 추출
  const examples: ProblemExample[] = [];
  
  // 예제 입력/출력 추출
  const exampleInputMatch = content.match(/## 예제 입력\n\n```\n([\s\S]*?)```/);
  const exampleOutputMatch = content.match(/## 예제 출력\n\n```\n([\s\S]*?)```/);
  
  if (exampleInputMatch && exampleOutputMatch) {
    examples.push({
      input: exampleInputMatch[1].trim(),
      output: exampleOutputMatch[1].trim()
    });
  }
  
  // JSON 데이터 생성
  const problemData: ProblemData = {
    id: fileName,
    title: titleMatch ? titleMatch[1] : '제목 없음',
    description: descriptionMatch ? descriptionMatch[1] : '설명 없음',
    difficulty,
    category,
    order: 1, // 기본값, 필요에 따라 변경
    content: content,
    solutionIdea: solutionIdea,
    pythonCode: pythonCode,
    cppCode: cppCode,
    input: input,
    output: output,
    examples: examples.length > 0 ? examples : [{ input: '', output: '' }],
    notes: notes || undefined
  };
  
  // 디렉토리 생성
  const outputDir = path.resolve(process.cwd(), 'data/problems', difficulty, category);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // JSON 파일로 저장
  const outputPath = path.join(outputDir, `${fileName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(problemData, null, 2));
  
  console.log(`성공: JSON 파일이 저장되었습니다: ${outputPath}`);
} catch (error) {
  console.error('오류: MDX 파일 처리 중 문제가 발생했습니다:', error);
  process.exit(1);
} 
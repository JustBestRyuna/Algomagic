import * as fs from 'fs';
import * as path from 'path';

/**
 * 카테고리 MDC 파일을 JSON 형식으로 변환하는 스크립트
 * 
 * 사용법: ts-node scripts/category-to-json.ts <MDC 파일 경로>
 * 예시: ts-node scripts/category-to-json.ts ./category.mdc
 */

interface CategoryData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  iconId: string;
  order: number;
}

// 커맨드 라인 인자 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('오류: MDC 파일 경로를 지정해주세요.');
  console.error('사용법: ts-node scripts/category-to-json.ts <MDC 파일 경로>');
  process.exit(1);
}

const mdcFilePath = args[0];

// 파일 존재 확인
if (!fs.existsSync(mdcFilePath)) {
  console.error(`오류: 파일을 찾을 수 없습니다: ${mdcFilePath}`);
  process.exit(1);
}

try {
  // MDC 파일 읽기
  const mdcContent = fs.readFileSync(mdcFilePath, 'utf-8');
  
  // JSON 코드 블록 찾기
  const jsonRegex = /```json\n([\s\S]*?)\n```/g;
  const jsonMatches = [...mdcContent.matchAll(jsonRegex)];
  
  if (jsonMatches.length === 0) {
    console.error('오류: MDC 파일에서 JSON 코드 블록을 찾을 수 없습니다.');
    process.exit(1);
  }
  
  // 가장 긴 JSON 코드 블록 선택 (보통 예시가 아닌 실제 데이터일 가능성이 높음)
  let longestJsonMatch = '';
  for (const match of jsonMatches) {
    if (match[1].length > longestJsonMatch.length) {
      longestJsonMatch = match[1];
    }
  }
  
  // JSON 파싱
  const categoryData: CategoryData = JSON.parse(longestJsonMatch);
  
  // 필수 필드 확인
  const requiredFields = ['id', 'title', 'description', 'difficulty', 'iconId', 'order'];
  for (const field of requiredFields) {
    if (!(field in categoryData)) {
      console.error(`오류: 필수 필드가 누락되었습니다: ${field}`);
      process.exit(1);
    }
  }
  
  // output 디렉토리 생성
  const outputDir = path.resolve(process.cwd(), 'data/categories', categoryData.difficulty);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // JSON 파일로 저장
  const outputPath = path.join(outputDir, `${categoryData.id}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(categoryData, null, 2));
  
  console.log(`성공: JSON 파일이 저장되었습니다: ${outputPath}`);
} catch (error) {
  console.error('오류: MDC 파일 처리 중 문제가 발생했습니다:', error);
  process.exit(1);
} 
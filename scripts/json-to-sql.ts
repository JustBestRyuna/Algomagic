import * as fs from 'fs';
import { generateSqlFromJson } from '../supabase_db_utility';

/**
 * JSON 파일을 SQL로 변환하는 스크립트
 * 
 * 사용법: ts-node scripts/json-to-sql.ts <타입> <JSON 파일 경로>
 * 예시: ts-node scripts/json-to-sql.ts category ./data/categories/tutorial/output.json
 */

// 커맨드 라인 인자 처리
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('오류: 타입과 JSON 파일 경로를 지정해주세요.');
  console.error('사용법: ts-node scripts/json-to-sql.ts <타입> <JSON 파일 경로>');
  console.error('예시: ts-node scripts/json-to-sql.ts category ./data/categories/tutorial/output.json');
  process.exit(1);
}

const type = args[0] as 'category' | 'problem';
const jsonFilePath = args[1];

// 타입 확인
if (type !== 'category' && type !== 'problem') {
  console.error('오류: 타입은 category 또는 problem만 가능합니다.');
  process.exit(1);
}

// 파일 존재 확인
if (!fs.existsSync(jsonFilePath)) {
  console.error(`오류: 파일을 찾을 수 없습니다: ${jsonFilePath}`);
  process.exit(1);
}

try {
  // JSON 파일 읽기
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  
  // SQL 생성
  const sql = generateSqlFromJson(jsonContent, type);
  
  // SQL 파일로 저장
  const outputPath = jsonFilePath.replace(/\.json$/, '.sql');
  fs.writeFileSync(outputPath, sql);
  
  console.log(`성공: SQL 파일이 저장되었습니다: ${outputPath}`);
} catch (error) {
  console.error('오류: JSON 파일 처리 중 문제가 발생했습니다:', error);
  process.exit(1);
} 
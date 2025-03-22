import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 모든 MDX 파일을 처리하여 JSON과 SQL 파일을 생성하는 스크립트
 * 
 * 사용법: ts-node scripts/process-all-mdx.ts <디렉토리 경로>
 * 예시: ts-node scripts/process-all-mdx.ts ./content/problems
 */

// 커맨드 라인 인자 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('오류: 디렉토리 경로를 지정해주세요.');
  console.error('사용법: ts-node scripts/process-all-mdx.ts <디렉토리 경로>');
  console.error('예시: ts-node scripts/process-all-mdx.ts ./content/problems');
  process.exit(1);
}

const dirPath = args[0];

// 디렉토리 존재 확인
if (!fs.existsSync(dirPath)) {
  console.error(`오류: 디렉토리를 찾을 수 없습니다: ${dirPath}`);
  process.exit(1);
}

// MDX 파일 목록 가져오기 함수
async function findMdxFiles(dir: string): Promise<string[]> {
  const allFiles: string[] = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 하위 디렉토리도 탐색
      const subFiles = await findMdxFiles(filePath);
      allFiles.push(...subFiles);
    } else if (file.endsWith('.mdx')) {
      allFiles.push(filePath);
    }
  }
  
  return allFiles;
}

// 메인 함수
async function main() {
  try {
    console.log(`MDX 파일 찾는 중...`);
    const mdxFiles = await findMdxFiles(dirPath);
    
    if (mdxFiles.length === 0) {
      console.log('처리할 MDX 파일이 없습니다.');
      return;
    }
    
    console.log(`${mdxFiles.length}개의 MDX 파일을 찾았습니다.`);
    
    // 각 MDX 파일 처리
    for (const mdxFile of mdxFiles) {
      console.log(`처리 중: ${mdxFile}`);
      
      try {
        // 1. MDX -> JSON 변환
        await execAsync(`ts-node scripts/mdx-to-problem-json.ts "${mdxFile}"`);
        
        // 2. JSON 파일 경로 찾기
        const jsonFilename = path.basename(mdxFile, '.mdx') + '.json';
        
        // 디렉토리 경로에서 난이도와 카테고리 추출
        const pathParts = mdxFile.split(path.sep);
        const problemsIndex = pathParts.indexOf('problems');
        
        if (problemsIndex === -1 || problemsIndex + 2 >= pathParts.length) {
          console.error(`파일 경로에서 난이도와 카테고리를 추출할 수 없습니다: ${mdxFile}`);
          continue;
        }
        
        const difficulty = pathParts[problemsIndex + 1];
        const category = pathParts[problemsIndex + 2];
        
        // JSON 파일 경로 구성
        const jsonPath = path.resolve(process.cwd(), 'data/problems', difficulty, category, jsonFilename);
        
        // JSON 파일 존재 확인
        if (!fs.existsSync(jsonPath)) {
          console.error(`JSON 파일을 찾을 수 없습니다: ${jsonPath}`);
          continue;
        }
        
        // 3. JSON -> SQL 변환
        await execAsync(`ts-node scripts/json-to-sql.ts problem "${jsonPath}"`);
        
        console.log(`완료: ${mdxFile}`);
      } catch (err) {
        console.error(`파일 처리 중 오류 발생: ${mdxFile}`, err);
      }
    }
    
    console.log('모든 작업이 완료되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main().catch(console.error); 
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 모든 MDC 파일을 처리하여 JSON과 SQL 파일을 생성하는 스크립트
 * 
 * 사용법: ts-node scripts/process-all.ts <타입> <디렉토리 경로>
 * 예시: ts-node scripts/process-all.ts category ./content/categories
 */

// 커맨드 라인 인자 처리
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('오류: 타입과 디렉토리 경로를 지정해주세요.');
  console.error('사용법: ts-node scripts/process-all.ts <타입> <디렉토리 경로>');
  console.error('예시: ts-node scripts/process-all.ts category ./content/categories');
  process.exit(1);
}

const type = args[0] as 'category' | 'problem';
const dirPath = args[1];

// 타입 확인
if (type !== 'category' && type !== 'problem') {
  console.error('오류: 타입은 category 또는 problem만 가능합니다.');
  process.exit(1);
}

// 디렉토리 존재 확인
if (!fs.existsSync(dirPath)) {
  console.error(`오류: 디렉토리를 찾을 수 없습니다: ${dirPath}`);
  process.exit(1);
}

// MDC 파일 목록 가져오기 함수
async function findMdcFiles(dir: string): Promise<string[]> {
  const allFiles: string[] = [];
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 하위 디렉토리도 탐색
      const subFiles = await findMdcFiles(filePath);
      allFiles.push(...subFiles);
    } else if (file.endsWith('.mdc')) {
      allFiles.push(filePath);
    }
  }
  
  return allFiles;
}

// 메인 함수
async function main() {
  try {
    console.log(`${type} MDC 파일 찾는 중...`);
    const mdcFiles = await findMdcFiles(dirPath);
    
    if (mdcFiles.length === 0) {
      console.log('처리할 MDC 파일이 없습니다.');
      return;
    }
    
    console.log(`${mdcFiles.length}개의 MDC 파일을 찾았습니다.`);
    
    // 각 MDC 파일 처리
    for (const mdcFile of mdcFiles) {
      console.log(`처리 중: ${mdcFile}`);
      
      try {
        // 1. MDC -> JSON 변환
        if (type === 'category') {
          await execAsync(`ts-node scripts/category-to-json.ts "${mdcFile}"`);
        } else {
          await execAsync(`ts-node scripts/problem-to-json.ts "${mdcFile}"`);
        }
        
        // 2. JSON 파일 경로 찾기
        const jsonPath = mdcFile.replace(/\.mdc$/, '.json');
        const jsonFilename = path.basename(jsonPath);
        
        // data 디렉토리에서 JSON 파일 찾기
        const dataDir = path.resolve(process.cwd(), 'data', type === 'category' ? 'categories' : 'problems');
        let foundJsonPath = '';
        
        await findJsonFile(dataDir, jsonFilename)
          .then(result => {
            foundJsonPath = result;
          })
          .catch(err => {
            console.error(`JSON 파일을 찾을 수 없습니다: ${jsonFilename}`, err);
          });
        
        if (!foundJsonPath) {
          console.error(`다음 단계를 건너뜁니다: ${mdcFile}`);
          continue;
        }
        
        // 3. JSON -> SQL 변환
        await execAsync(`ts-node scripts/json-to-sql.ts ${type} "${foundJsonPath}"`);
        
        console.log(`완료: ${mdcFile}`);
      } catch (err) {
        console.error(`파일 처리 중 오류 발생: ${mdcFile}`, err);
      }
    }
    
    console.log('모든 작업이 완료되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
}

// JSON 파일 찾기 함수
async function findJsonFile(dir: string, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let foundPath = '';
    
    function searchDir(currentDir: string) {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          searchDir(filePath);
        } else if (file === filename) {
          foundPath = filePath;
          return;
        }
      }
    }
    
    try {
      searchDir(dir);
      if (foundPath) {
        resolve(foundPath);
      } else {
        reject(new Error(`파일을 찾을 수 없습니다: ${filename}`));
      }
    } catch (err) {
      reject(err);
    }
  });
}

// 실행
main().catch(console.error); 
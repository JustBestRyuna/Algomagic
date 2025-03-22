import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 카테고리 타입 정의
interface Category {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  iconId: string;
  order: number;
}

// 문제 타입 정의
interface Problem {
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
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  notes?: string;
}

/**
 * 카테고리를 데이터베이스에 저장하는 함수
 */
export async function saveCategory(category: Category) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: category.id,
        title: category.title,
        description: category.description,
        difficulty_id: category.difficulty,
        icon_id: category.iconId,
        order_num: category.order
      }, {
        onConflict: 'id'
      });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error saving category:', error);
    return { success: false, error };
  }
}

/**
 * 문제를 데이터베이스에 저장하는 함수
 */
export async function saveProblem(problem: Problem) {
  try {
    // 트랜잭션으로 처리해야 하지만, Supabase에서는 직접적인 트랜잭션 지원이 없음
    // 따라서 여러 단계로 나누어 처리하고 오류 발생 시 롤백 처리 필요

    // 1. 문제 기본 정보 저장
    const { data: problemData, error: problemError } = await supabase
      .from('problems')
      .upsert({
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty_id: problem.difficulty,
        category_id: problem.category,
        order_num: problem.order,
        content: problem.content,
        solution_idea: problem.solutionIdea,
        python_code: problem.pythonCode,
        cpp_code: problem.cppCode,
        input_description: problem.input,
        output_description: problem.output,
        notes: problem.notes
      }, {
        onConflict: 'difficulty_id,category_id,id'
      });

    if (problemError) {
      throw problemError;
    }

    // 2. 기존 예제 삭제 (새로운 예제로 대체하기 위함)
    const { error: deleteError } = await supabase
      .from('examples')
      .delete()
      .match({
        difficulty_id: problem.difficulty,
        category_id: problem.category,
        problem_id: problem.id
      });

    if (deleteError) {
      throw deleteError;
    }

    // 3. 새 예제 추가
    if (problem.examples && problem.examples.length > 0) {
      const examples = problem.examples.map((example, index) => ({
        problem_id: problem.id,
        category_id: problem.category,
        difficulty_id: problem.difficulty,
        input_example: example.input,
        output_example: example.output,
        explanation: example.explanation,
        order_num: index + 1
      }));

      const { error: exampleError } = await supabase
        .from('examples')
        .insert(examples);

      if (exampleError) {
        throw exampleError;
      }
    }

    return { success: true, data: problemData };
  } catch (error) {
    console.error('Error saving problem:', error);
    return { success: false, error };
  }
}

/**
 * JSON 문자열에서 카테고리 객체로 변환하는 함수
 */
export function parseCategoryJson(json: string): Category {
  try {
    const category = JSON.parse(json);
    
    // 필수 필드 확인
    const requiredFields = ['id', 'title', 'description', 'difficulty', 'iconId', 'order'];
    for (const field of requiredFields) {
      if (!(field in category)) {
        throw new Error(`필수 필드가 누락되었습니다: ${field}`);
      }
    }
    
    return category as Category;
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw error;
  }
}

/**
 * JSON 문자열에서 문제 객체로 변환하는 함수
 */
export function parseProblemJson(json: string): Problem {
  try {
    const problem = JSON.parse(json);
    
    // 필수 필드 확인
    const requiredFields = [
      'id', 'title', 'description', 'difficulty', 'category', 
      'order', 'content', 'solutionIdea', 'pythonCode', 'cppCode', 
      'input', 'output', 'examples'
    ];
    
    for (const field of requiredFields) {
      if (!(field in problem)) {
        throw new Error(`필수 필드가 누락되었습니다: ${field}`);
      }
    }
    
    // examples 배열 확인
    if (!Array.isArray(problem.examples) || problem.examples.length === 0) {
      throw new Error('examples는 최소 하나 이상의 항목을 포함해야 합니다.');
    }
    
    return problem as Problem;
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    throw error;
  }
}

/**
 * 카테고리 JSON을 파싱하여 DB에 저장하는 함수
 */
export async function importCategoryFromJson(json: string) {
  try {
    const category = parseCategoryJson(json);
    return await saveCategory(category);
  } catch (error) {
    console.error('카테고리 가져오기 오류:', error);
    return { success: false, error };
  }
}

/**
 * 문제 JSON을 파싱하여 DB에 저장하는 함수
 */
export async function importProblemFromJson(json: string) {
  try {
    const problem = parseProblemJson(json);
    return await saveProblem(problem);
  } catch (error) {
    console.error('문제 가져오기 오류:', error);
    return { success: false, error };
  }
}

/**
 * SQL 쿼리 생성 함수 (카테고리 삽입)
 */
export function generateCategoryInsertSql(category: Category): string {
  return `
INSERT INTO categories (id, title, description, difficulty_id, icon_id, order_num)
VALUES ('${escapeStringForSql(category.id)}', '${escapeStringForSql(category.title)}', '${escapeStringForSql(category.description)}', '${escapeStringForSql(category.difficulty)}', '${escapeStringForSql(category.iconId)}', ${category.order})
ON CONFLICT (id) DO UPDATE SET
  title = '${escapeStringForSql(category.title)}',
  description = '${escapeStringForSql(category.description)}',
  difficulty_id = '${escapeStringForSql(category.difficulty)}',
  icon_id = '${escapeStringForSql(category.iconId)}',
  order_num = ${category.order},
  updated_at = now();
`;
}

/**
 * SQL 문자열 이스케이프
 */
function escapeStringForSql(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * SQL 쿼리 생성 함수 (문제 및 예제 삽입)
 */
export function generateProblemInsertSql(problem: Problem): string {
  // 문제 삽입 쿼리
  const problemInsertSql = `
-- 문제 데이터 삽입
INSERT INTO problems (id, category_id, difficulty_id, title, description, order_num, content, solution_idea, python_code, cpp_code, input_description, output_description, notes)
VALUES (
  '${escapeStringForSql(problem.id)}', 
  '${escapeStringForSql(problem.category)}', 
  '${escapeStringForSql(problem.difficulty)}', 
  '${escapeStringForSql(problem.title)}', 
  '${escapeStringForSql(problem.description)}', 
  ${problem.order}, 
  '${escapeStringForSql(problem.content)}', 
  '${escapeStringForSql(problem.solutionIdea)}', 
  '${escapeStringForSql(problem.pythonCode)}', 
  '${escapeStringForSql(problem.cppCode)}', 
  '${escapeStringForSql(problem.input)}', 
  '${escapeStringForSql(problem.output)}', 
  ${problem.notes ? `'${escapeStringForSql(problem.notes)}'` : 'NULL'}
)
ON CONFLICT (difficulty_id, category_id, id) DO UPDATE SET
  title = '${escapeStringForSql(problem.title)}',
  description = '${escapeStringForSql(problem.description)}',
  order_num = ${problem.order},
  content = '${escapeStringForSql(problem.content)}',
  solution_idea = '${escapeStringForSql(problem.solutionIdea)}',
  python_code = '${escapeStringForSql(problem.pythonCode)}',
  cpp_code = '${escapeStringForSql(problem.cppCode)}',
  input_description = '${escapeStringForSql(problem.input)}',
  output_description = '${escapeStringForSql(problem.output)}',
  notes = ${problem.notes ? `'${escapeStringForSql(problem.notes)}'` : 'NULL'},
  updated_at = now();

-- 기존 예제 삭제
DELETE FROM examples 
WHERE difficulty_id = '${escapeStringForSql(problem.difficulty)}'
  AND category_id = '${escapeStringForSql(problem.category)}'
  AND problem_id = '${escapeStringForSql(problem.id)}';
`;

  // 예제 삽입 쿼리
  let examplesInsertSql = '';
  problem.examples.forEach((example, index) => {
    examplesInsertSql += `
-- 예제 ${index + 1} 삽입
INSERT INTO examples (problem_id, category_id, difficulty_id, input_example, output_example, explanation, order_num)
VALUES (
  '${escapeStringForSql(problem.id)}', 
  '${escapeStringForSql(problem.category)}', 
  '${escapeStringForSql(problem.difficulty)}', 
  '${escapeStringForSql(example.input)}', 
  '${escapeStringForSql(example.output)}', 
  ${example.explanation ? `'${escapeStringForSql(example.explanation)}'` : 'NULL'}, 
  ${index + 1}
);
`;
  });

  return problemInsertSql + examplesInsertSql;
}

/**
 * JSON 파일을 DB SQL 쿼리로 변환
 */
export function generateSqlFromJson(json: string, type: 'category' | 'problem'): string {
  try {
    if (type === 'category') {
      const category = parseCategoryJson(json);
      return generateCategoryInsertSql(category);
    } else {
      const problem = parseProblemJson(json);
      return generateProblemInsertSql(problem);
    }
  } catch (error) {
    console.error('SQL 생성 오류:', error);
    throw error;
  }
} 
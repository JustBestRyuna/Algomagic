-- Supabase 테이블 생성 SQL

-- 난이도 테이블
CREATE TABLE difficulties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  color_bg TEXT NOT NULL,
  color_bg_light TEXT NOT NULL,
  color_hover TEXT NOT NULL,
  color_text TEXT NOT NULL,
  color_border TEXT NOT NULL,
  color_accent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 아이콘 테이블
CREATE TABLE icons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  svg_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 카테고리 테이블
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty_id TEXT NOT NULL REFERENCES difficulties(id) ON DELETE CASCADE,
  icon_id TEXT NOT NULL REFERENCES icons(id) ON DELETE RESTRICT,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(difficulty_id, id)
);

-- 문제 테이블
CREATE TABLE problems (
  id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  difficulty_id TEXT NOT NULL REFERENCES difficulties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  content TEXT NOT NULL,
  solution_idea TEXT NOT NULL,
  python_code TEXT,
  cpp_code TEXT,
  input_description TEXT NOT NULL,
  output_description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  PRIMARY KEY (difficulty_id, category_id, id),
  UNIQUE(difficulty_id, category_id, id)
);

-- 예제 테이블
CREATE TABLE examples (
  id SERIAL PRIMARY KEY,
  problem_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  difficulty_id TEXT NOT NULL,
  input_example TEXT NOT NULL,
  output_example TEXT NOT NULL,
  explanation TEXT,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  FOREIGN KEY (difficulty_id, category_id, problem_id) REFERENCES problems(difficulty_id, category_id, id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_categories_difficulty ON categories(difficulty_id);
CREATE INDEX idx_problems_category ON problems(category_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty_id);
CREATE INDEX idx_examples_problem ON examples(difficulty_id, category_id, problem_id);

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_difficulties_timestamp
BEFORE UPDATE ON difficulties
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_icons_timestamp
BEFORE UPDATE ON icons
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_problems_timestamp
BEFORE UPDATE ON problems
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_examples_timestamp
BEFORE UPDATE ON examples
FOR EACH ROW EXECUTE PROCEDURE update_timestamp(); 
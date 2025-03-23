# 알고매직 (Algomagic)

알고리즘 문제풀이 가이드를 제공하는 웹서비스입니다.

## 프로젝트 소개

알고매직은 여러 온라인 저지(OJ)의 문제들을 분석하여 알고리즘별·난이도별 가이드로 정리한 서비스입니다.
간단한 문제 설명과 예시, 풀이 아이디어 등을 Markdown 또는 MDX 형태로 제공하며, 일부 문제별 상호작용 컴포넌트(React)를 섞어 더 나은 알고리즘 이해 경험을 제공합니다.

## 기술 스택

- **프론트엔드**: Remix
- **백엔드**: Remix (서버 사이드)
- **데이터베이스**: PostgreSQL (Supabase)
- **스타일링**: Tailwind CSS
- **마크다운 처리**: MDX Bundler
- **배포**: Render
- **테스트**: Vitest, React Testing Library, MSW

## 로컬 개발 환경 설정

1. 저장소 클론:

```sh
git clone <저장소-URL>
cd Algomagic
```

2. 의존성 설치:

```sh
npm install
```

3. 환경 변수 설정:

`.env` 파일을 생성하고 다음 값들을 설정하세요:

```
DATABASE_URL="file:./data.db?connection_limit=1"
SESSION_SECRET="your-session-secret"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

4. 개발 서버 실행:

```sh
npm run dev
```

## 테스트

알고매직은 테스트 주도 개발(TDD) 방식을 채택하고 있으며, 다양한 테스트를 실행할 수 있습니다.

### 테스트 실행 방법

다음 명령어를 사용하여 테스트를 실행할 수 있습니다:

```sh
# 통합 테스트 실행
npm test

# 모든 테스트 실행
npm run test:all

# UI 테스트 실행
npm run test:ui

# 테스트를 감시 모드로 실행 (파일 변경 시 자동 재실행)
npm run test:watch

# 테스트 커버리지 확인
npm run test:coverage
```

### 테스트 구조

- `test/components/`: UI 컴포넌트 테스트
- `test/routes/`: 라우트 컴포넌트 테스트
- `test/integration/`: 통합 테스트
- `test/test-utils.tsx`: 테스트용 유틸리티 함수
- `test/setup-test-env.ts`: 테스트 환경 설정

### 테스트 도구

- Vitest: 테스트 러너
- React Testing Library: UI 테스트
- MSW(Mock Service Worker): API 요청 모킹
- Happy DOM: 테스트 환경의 DOM 구현
- @remix-run/testing: Remix 애플리케이션 테스트 유틸리티

## 주요 기능

### 튜토리얼 난이도

프로그래밍 기초를 배우기 위한 문제들을 단계별로 모았습니다.

- 출력, 사칙연산, 조건문, 반복문, 문자열, 배열, 입출력 심화 등 기초 개념별 문제 제공
- 각 문제별 상세 설명, 풀이 접근법, Python 및 C++ 모범 답안 제공

### 브론즈 난이도

알고리즘 실력을 키우기 위한 기본 문제들을 모았습니다.

- 구현, 시뮬레이션, 많은 조건 분기 등 유형별 문제 제공
- 알고리즘 설명 및 풀이 방법 제공

## 데이터 구조

데이터베이스는 다음과 같은 테이블로 구성되어 있습니다:

- `difficulties`: 문제의 난이도 정보
- `icons`: 카테고리 아이콘 정보
- `categories`: 알고리즘 카테고리 정보
- `problems`: 문제 정보
- `examples`: 문제별 예제 입출력

## 콘텐츠 관리 워크플로우

### 새로운 작업 흐름 (SQL 직접 생성)

### 새 카테고리 추가하기

1. `content/templates/category.mdc` 양식을 사용하여 새 카테고리 정보를 SQL 형식으로 작성
2. 작성된 SQL을 `content/categories/difficulty/category-id.sql`에 저장
3. 생성된 SQL을 Supabase에 직접 적용

### 새 문제 추가하기

1. `content/templates/problem.mdc` 양식을 사용하여 새 문제 정보를 SQL 형식으로 작성
2. 작성된 SQL을 `content/problems/difficulty/category/problem-id.sql`에 저장
3. 생성된 SQL을 Supabase에 직접 적용

## 유틸리티 스크립트

- `scripts/category-to-json.ts`: 카테고리 MDX 파일을 JSON으로 변환
- `scripts/problem-to-json.ts`: 문제 MDX 파일을 JSON으로 변환
- `scripts/json-to-sql.ts`: JSON 파일을 SQL 쿼리로 변환
- `scripts/process-all-mdx.ts`: 모든 MDX 파일을 일괄 처리
- `scripts/process-all.ts`: 일괄 처리 유틸리티
- `supabase_db_utility.ts`: Supabase 데이터베이스 관련 유틸리티 함수

## 디렉토리 구조

- `app/routes/`: 페이지 라우팅 및 컴포넌트
- `app/components/`: 재사용 가능한 UI 컴포넌트
- `app/utils/`: 유틸리티 함수
- `content/problems/`: 문제 MDX 파일
- `scripts/`: 데이터 변환 및 처리 스크립트

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.
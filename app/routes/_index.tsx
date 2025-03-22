import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "알고매직(Algomagic) - 알고리즘 문제풀이 가이드" },
    { name: "description", content: "알고리즘 문제풀이 가이드를 제공하는 웹서비스" },
  ];
};

export default function Index() {
  return (
    <div>
      {/* 히어로 섹션 */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">알고리즘 학습의 새로운 방법</span>
              <span className="block text-indigo-600">알고매직</span>
            </h1>
            <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              여러 온라인 저지(OJ)의 문제들을 분석하여 알고리즘별·난이도별로 정리된 가이드를 제공합니다.
              쉽고 친절한 설명과 풀이 아이디어로 알고리즘 학습을 도와드립니다.
            </p>
            <div className="max-w-md mx-auto mt-5 sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/tutorial"
                  className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white bg-tutorial-600 border border-transparent rounded-md hover:bg-tutorial-700 md:py-4 md:text-lg md:px-10"
                  style={{ color: 'white' }}
                >
                  튜토리얼 시작하기
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/bronze"
                  className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white bg-bronze-600 border border-transparent rounded-md hover:bg-bronze-700 md:py-4 md:text-lg md:px-10"
                  style={{ color: 'white' }}
                >
                  브론즈 문제 풀기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 특징 섹션 */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">알고매직 특징</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              알고리즘 학습을 더 효과적으로
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              알고매직은 초보자부터 중급자까지 누구나 쉽게 알고리즘을 배울 수 있도록 설계되었습니다.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-tutorial-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">단계별 학습</h3>
                  <p className="mt-2 text-base text-gray-500">
                    튜토리얼 단계부터 브론즈 난이도까지, 체계적으로 알고리즘 개념을 학습할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-bronze-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">상세한 풀이 가이드</h3>
                  <p className="mt-2 text-base text-gray-500">
                    각 문제마다 친절한 설명과 풀이 아이디어를 제공하여 혼자서도 학습이 가능합니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-tutorial-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">코드 예제 제공</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Python과 C++로 작성된 모범 답안 코드를 제공하며, 주석을 통해 코드를 이해하기 쉽게 설명합니다.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-bronze-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">인터랙티브 학습</h3>
                  <p className="mt-2 text-base text-gray-500">
                    일부 문제에는 알고리즘 이해를 돕는 상호작용 컴포넌트가 포함되어 있어 직접 체험하며 학습할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 난이도 섹션 */}
      <div className="bg-gray-50 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
            난이도별 학습 가이드
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg border border-tutorial-100">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-tutorial-500 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-2xl font-bold text-gray-900">튜토리얼 난이도</h3>
                    <p className="mt-2 text-base text-gray-500">
                      프로그래밍 기초를 다지는 단계입니다. 출력, 사칙연산, 조건문, 반복문 등 기초 개념을 학습합니다.
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-tutorial-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">출력 / 사칙연산</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-tutorial-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">조건문 / 반복문</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-tutorial-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">문자열 / 배열</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-tutorial-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/tutorial" className="font-medium text-tutorial-700 hover:text-tutorial-800">
                    튜토리얼 시작하기<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg border border-bronze-100">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-bronze-500 rounded-md p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-2xl font-bold text-gray-900">브론즈 난이도</h3>
                    <p className="mt-2 text-base text-gray-500">
                      기초를 응용한 간단한 문제들입니다. 구현, 시뮬레이션, 조건 분기 등 실전 문제 풀이를 시작합니다.
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-bronze-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">구현 문제</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-bronze-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">시뮬레이션</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-bronze-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">조건 분기</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-bronze-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link to="/bronze" className="font-medium text-bronze-700 hover:text-bronze-800">
                    브론즈 문제 풀어보기<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

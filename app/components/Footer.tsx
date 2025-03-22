export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              소개
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              제안하기
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              GitHub
            </a>
          </div>
          <div className="text-sm text-gray-500">
            © 2024 알고매직. 모든 권리 보유.
          </div>
        </div>
      </div>
    </footer>
  );
} 
import { Github } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ДСК Анализатор</h1>
            <p className="text-sm text-gray-600 mt-1">Анализ на банкови движения</p>
          </div>
          <a
            href="https://github.com/PetromirDev/dsk-expenses-analyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Github size={20} />
            <span className="hidden lg:inline">
              Source Code (за да питаш ChatGPT дали има вируси)
            </span>
          </a>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-12 text-center bg-white p-8 lg:py-12 border-t border-gray-200">
      <div className="max-w-2xl mx-auto px-4">
        <p className="text-lg font-semibold text-gray-700 mb-4">Дай някой лев, мишка 🐭</p>
        <div className="flex flex-col items-center gap-3 text-sm mb-4">
          <span className="font-medium text-gray-700">Revolut:</span>
          <a
            href="https://revolut.me/petromirp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-mono bg-indigo-50 px-3 py-1 rounded transition-colors"
          >
            @petromirp
          </a>
        </div>
        <div className="flex flex-col items-center gap-3 text-sm">
          <span className="font-medium text-gray-700">Ethereum:</span>
          <code className="text-xs bg-gray-100 px-3 py-2 rounded text-gray-800 break-all max-w-full">
            0xfa12F44071291d7D75FFC201C1A15f904Bc78268
          </code>
        </div>
      </div>
    </footer>
  )
}

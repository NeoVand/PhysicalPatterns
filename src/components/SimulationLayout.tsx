import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils/cn'

interface SimulationLayoutProps {
  title: string
  subtitle: string
  controls: ReactNode
  canvas: ReactNode
  learningContent?: ReactNode
}

export default function SimulationLayout({
  title,
  subtitle,
  controls,
  canvas,
  learningContent
}: SimulationLayoutProps) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="h-screen w-screen fixed inset-0 flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header - Fixed at top */}
      <header className="h-16 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          aria-label="Back to home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas Area - Full screen */}
        <div className="absolute inset-0">
          {canvas}
        </div>

        {/* Sidebar */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full bg-black/80 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 z-40 shadow-2xl",
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
          style={{ width: '320px' }}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/50">
            <h2 className="text-lg font-semibold text-white">Controls</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            {controls}
          </div>
        </div>

        {/* Toggle Button - Always visible */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute right-4 top-4 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 hover:bg-black/90 text-white z-30 transition-all hover:scale-105 shadow-lg"
            aria-label="Open controls"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Learning Content - Scrollable overlay */}
      {learningContent && (
        <div className="absolute bottom-0 left-0 right-0 max-h-[50vh] bg-black/95 backdrop-blur-md border-t border-white/10 overflow-y-auto z-30">
          <div className="p-8">
            <button
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              aria-label="Close learning content"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {learningContent}
          </div>
        </div>
      )}
    </div>
  )
} 
import { useParams, useNavigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'
import LoadingScreen from '../components/LoadingScreen'

// Map of pattern IDs to their components (we'll create these next)
const patternComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'game-of-life': lazy(() => import('../patterns/GameOfLife')),
  'ising-model': lazy(() => import('../patterns/IsingModel')),
  'percolation': lazy(() => import('../patterns/Percolation')),
  'reaction-diffusion': lazy(() => import('../patterns/ReactionDiffusion')),
  'wave-equation': lazy(() => import('../patterns/WaveEquation')),
  'boids': lazy(() => import('../patterns/Boids')),
}

export default function PatternPage() {
  const { patternId } = useParams<{ patternId: string }>()
  const navigate = useNavigate()

  if (!patternId || !patternComponents[patternId]) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Pattern Not Found</h1>
          <p className="text-gray-400 mb-8">The requested pattern doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    )
  }

  const PatternComponent = patternComponents[patternId]

  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-400 mb-4">Simulation Error</h1>
              <p className="text-gray-400 mb-8">There was an error loading this pattern.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={<LoadingScreen />}>
          <PatternComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 
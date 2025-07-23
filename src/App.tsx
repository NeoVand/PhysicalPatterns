import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  Sparkles, 
  Waves, 
  Grid3x3, 
  Zap, 
  GitBranch, 
  Bird,
  ArrowRight,
  Github,
  Activity
} from 'lucide-react'

// Lazy load pattern components
const GameOfLife = lazy(() => import('./patterns/GameOfLife'))
const IsingModel = lazy(() => import('./patterns/IsingModel'))
const Percolation = lazy(() => import('./patterns/Percolation'))
const ReactionDiffusion = lazy(() => import('./patterns/ReactionDiffusion'))
const WaveEquation = lazy(() => import('./patterns/WaveEquation'))
const Boids = lazy(() => import('./patterns/Boids'))

// Pattern data
const patterns = [
  {
    id: 'game-of-life',
    title: 'Game of Life',
    description: 'Conway\'s cellular automaton simulating evolution through simple rules',
    icon: Grid3x3,
    gradient: 'from-cyan-500 to-blue-500',
    path: '/game-of-life',
    component: GameOfLife
  },
  {
    id: 'ising-model',
    title: 'Ising Model',
    description: 'Magnetic phase transitions and spontaneous magnetization',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    path: '/ising-model',
    component: IsingModel
  },
  {
    id: 'percolation',
    title: 'Percolation',
    description: 'Critical phenomena in random systems and cluster formation',
    icon: GitBranch,
    gradient: 'from-green-500 to-teal-500',
    path: '/percolation',
    component: Percolation
  },
  {
    id: 'reaction-diffusion',
    title: 'Reaction-Diffusion',
    description: 'Turing patterns emerging from chemical interactions',
    icon: Zap,
    gradient: 'from-orange-500 to-red-500',
    path: '/reaction-diffusion',
    component: ReactionDiffusion
  },
  {
    id: 'wave-equation',
    title: 'Wave Equation',
    description: 'Propagation of waves through space with interference',
    icon: Waves,
    gradient: 'from-indigo-500 to-purple-500',
    path: '/wave-equation',
    component: WaveEquation
  },
  {
    id: 'boids',
    title: 'Boids',
    description: 'Flocking behavior emerging from simple steering rules',
    icon: Bird,
    gradient: 'from-rose-500 to-orange-500',
    path: '/boids',
    component: Boids
  }
]

// Loading component
function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000'
    }}>
      <div style={{ textAlign: 'center' }}>
        <Activity 
          size={32} 
          color="#3b82f6" 
          style={{ 
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} 
        />
        <p style={{ color: '#666', fontSize: '14px' }}>Loading simulation...</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Pattern card component
function PatternCard({ pattern }: { pattern: typeof patterns[0] }) {
  const Icon = pattern.icon
  
  return (
    <Link 
      to={pattern.path}
      style={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-4px)'
        el.style.background = 'rgba(255, 255, 255, 0.06)'
        el.style.borderColor = 'rgba(255, 255, 255, 0.2)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.background = 'rgba(255, 255, 255, 0.03)'
        el.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Gradient background */}
      <div 
        className={`absolute inset-0 opacity-0 bg-gradient-to-br ${pattern.gradient}`}
        style={{ 
          transition: 'opacity 0.3s',
          filter: 'blur(40px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.2'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0'
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} style={{ color: '#fff' }} />
          </div>
          <ArrowRight 
            size={20} 
            style={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              transition: 'transform 0.3s'
            }}
          />
        </div>
        
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.02em'
        }}>
          {pattern.title}
        </h3>
        
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: 1.5
        }}>
          {pattern.description}
        </p>
      </div>
    </Link>
  )
}

// Home page component
function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      padding: '60px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background gradient */}
      <div style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 50%)',
        animation: 'rotate 30s linear infinite',
        opacity: 0.5
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            margin: '0 0 16px 0',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            Physical Patterns
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Explore the beauty of emergent phenomena through interactive physics simulations
          </p>
          
          {/* GitHub link */}
          <a
            href="https://github.com/yourusername/physical-patterns"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Github size={16} />
            View on GitHub
          </a>
        </div>
        
        {/* Pattern grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {patterns.map(pattern => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
        
        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '80px',
          paddingTop: '40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '14px',
            margin: 0
          }}>
            Built with React, Three.js, and WebGL • {new Date().getFullYear()}
          </p>
        </div>
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Router component to handle GitHub Pages routing
function AppRouter() {
  const location = useLocation()
  const isGitHubPages = window.location.hostname.includes('github.io')
  const basename = isGitHubPages ? '/PhysicalPatterns' : ''
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {patterns.map(pattern => (
        <Route
          key={pattern.id}
          path={pattern.path}
          element={
            <Suspense fallback={<LoadingScreen />}>
              <pattern.component />
            </Suspense>
          }
        />
      ))}
    </Routes>
  )
}

export default function App() {
  const isGitHubPages = window.location.hostname.includes('github.io')
  const basename = isGitHubPages ? '/PhysicalPatterns' : ''
  
  return (
    <Router basename={basename}>
      <AppRouter />
    </Router>
  )
}

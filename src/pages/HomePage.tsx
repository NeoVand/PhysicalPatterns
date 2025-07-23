import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  const patterns = [
    {
      id: 'ising-model',
      title: 'Ising Model',
      icon: '🌡️',
      description: 'Explore ferromagnetism and phase transitions',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      shadowColor: 'shadow-cyan-500/20',
    },
    {
      id: 'game-of-life',
      title: 'Game of Life',
      icon: '🧬',
      description: "Conway's cellular automaton",
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      shadowColor: 'shadow-pink-500/20',
    },
    {
      id: 'percolation',
      title: 'Percolation',
      icon: '💧',
      description: 'Phase transitions in porous media',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      shadowColor: 'shadow-indigo-500/20',
    },
    {
      id: 'reaction-diffusion',
      title: 'Reaction-Diffusion',
      icon: '🎨',
      description: 'Turing patterns and morphogenesis',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      id: 'wave-equation',
      title: 'Wave Equation',
      icon: '🌊',
      description: 'Simulate wave propagation',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      id: 'boids',
      title: 'Boids',
      icon: '🦜',
      description: 'Flocking behavior simulation',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      shadowColor: 'shadow-orange-500/20',
    },
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-float animation-delay-2000" />
      
      {/* Content */}
      <div className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              Physical
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%] animation-delay-1000">
              Patterns
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore the beauty of physics through interactive simulations. 
            Learn, experiment, and discover the patterns that govern our universe.
          </p>
        </header>

        {/* Pattern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {patterns.map((pattern, index) => (
            <button
              key={pattern.id}
              onClick={() => navigate(`/pattern/${pattern.id}`)}
              className={`
                group relative overflow-hidden rounded-2xl p-8
                bg-gradient-to-br from-background-secondary to-background-tertiary
                border border-white/5 backdrop-blur-sm
                transform transition-all duration-500 hover:scale-[1.02]
                hover:border-white/10 ${pattern.shadowColor}
                hover:shadow-2xl animate-float
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Overlay */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100
                bg-gradient-to-br ${pattern.gradient}
                transition-opacity duration-500 blur-3xl
              `} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {pattern.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:${pattern.gradient} transition-all duration-300">
                  {pattern.title}
                </h2>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {pattern.description}
                </p>
              </div>

              {/* Hover Glow */}
              <div className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-32 h-32 bg-gradient-to-r ${pattern.gradient}
                rounded-full blur-2xl opacity-0 group-hover:opacity-50
                transition-opacity duration-500
              `} />
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-white mb-12">
            Built for Learning & Discovery
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-white/5">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Educational</h3>
              <p className="text-gray-400">Detailed explanations with interactive equations and visualizations</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-white/5">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">High Performance</h3>
              <p className="text-gray-400">WebGL-powered simulations running at 60fps on any device</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-white/5">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-white mb-2">Export & Share</h3>
              <p className="text-gray-400">Save images and videos of your favorite patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
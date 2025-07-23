export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Spinning circles */}
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-delay-1000"></div>
          <div className="absolute inset-4 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-2000"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Loading Physical Patterns</h2>
        <p className="text-gray-400">Preparing simulations...</p>
      </div>
    </div>
  );
} 
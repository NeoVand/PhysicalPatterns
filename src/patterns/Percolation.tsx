import { ChevronLeft } from 'lucide-react'

export default function Percolation() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <button
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 16px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000
        }}
        onClick={() => window.history.back()}
      >
        <ChevronLeft size={16} />
        Back
      </button>
      
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Percolation</h1>
      <p style={{ color: '#666' }}>Coming soon...</p>
    </div>
  )
} 
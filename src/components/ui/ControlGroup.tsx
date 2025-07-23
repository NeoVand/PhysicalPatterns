import { ReactNode } from 'react'
import { cn } from '../../lib/utils/cn'

interface ControlGroupProps {
  label: string
  children: ReactNode
  className?: string
}

export function ControlGroup({ label, children, className }: ControlGroupProps) {
  return (
    <div className={cn("mb-6", className)}>
      <label className="text-sm font-medium text-gray-200 mb-3 block uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

interface ButtonProps {
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function Button({ 
  onClick, 
  variant = 'primary', 
  size = 'md',
  children, 
  className,
  disabled = false
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  )
}

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label?: string
  unit?: string
}

export function Slider({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 1,
  label,
  unit = ''
}: SliderProps) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">{label}</span>
          <span className="text-white font-medium font-mono">
            {value}{unit}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer 
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/50
                   [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 
                   [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-500 
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:transition-all 
                   [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:shadow-lg
                   [&::-moz-range-thumb]:shadow-blue-500/50"
      />
    </div>
  )
}

interface InfoBoxProps {
  children: ReactNode
  variant?: 'info' | 'warning' | 'success'
}

export function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  const variants = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
    success: 'bg-green-500/10 border-green-500/30 text-green-200',
  }

  return (
    <div className={cn(
      "p-4 rounded-lg border backdrop-blur-sm",
      variants[variant]
    )}>
      {children}
    </div>
  )
} 
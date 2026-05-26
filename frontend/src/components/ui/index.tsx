import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 hover:border-slate-500',
      ghost: 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20',
      success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    }
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'cyan'
  className?: string
}

export const Badge = ({ children, variant = 'gray', className }: BadgeProps) => {
  const variants = {
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    yellow: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border border-red-500/20',
    purple: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
    gray: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
    cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export const Card = ({ children, className, hover, onClick, style }: CardProps) => (
  <div
    onClick={onClick}
    style={style}
    className={cn(
      'bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm',
      hover && 'cursor-pointer transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5',
      onClick && 'cursor-pointer',
      className
    )}
  >
    {children}
  </div>
)

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-slate-700/50 rounded-lg', className)} />
)

export const SkeletonCard = () => (
  <Card className="p-6">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-4/5" />
  </Card>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['from-blue-500 to-blue-600', 'from-violet-500 to-violet-600', 'from-emerald-500 to-emerald-600', 'from-amber-500 to-amber-600', 'from-pink-500 to-pink-600', 'from-cyan-500 to-cyan-600']
  const colorIndex = name.charCodeAt(0) % colors.length

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover ring-2 ring-slate-700', sizes[size], className)} />
  }
  return (
    <div className={cn('rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white ring-2 ring-slate-700 flex-shrink-0', sizes[size], `bg-gradient-to-br ${colors[colorIndex]}`, className)}>
      {initials}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          ref={ref}
          className={cn(
            'w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm transition-all duration-150',
            'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 text-sm px-4 py-2.5 transition-all duration-150',
          'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal = ({ open, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl', sizes[size])}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-slate-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
interface ProgressProps {
  value: number
  max?: number
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export const Progress = ({ value, max = 100, color = 'blue', size = 'md', showLabel }: ProgressProps) => {
  const pct = Math.min((value / max) * 100, 100)
  const colors = {
    blue: 'from-blue-500 to-blue-400',
    green: 'from-emerald-500 to-emerald-400',
    yellow: 'from-amber-500 to-amber-400',
    red: 'from-red-500 to-red-400',
    purple: 'from-violet-500 to-violet-400',
  }
  const heights = { sm: 'h-1.5', md: 'h-2.5' }
  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex-1 bg-slate-700/50 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-slate-400 w-10 text-right">{Math.round(pct)}%</span>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  gradient: string
  subtitle?: string
}

export const StatCard = ({ title, value, change, changeType, icon, gradient, subtitle }: StatCardProps) => (
  <Card className="p-6 card-hover">
    <div className="flex items-start justify-between mb-4">
      <div className={cn('p-3 rounded-xl', gradient)}>
        <div className="text-white w-5 h-5">{icon}</div>
      </div>
      {change && (
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full',
          changeType === 'up' ? 'text-emerald-400 bg-emerald-500/10' :
          changeType === 'down' ? 'text-red-400 bg-red-500/10' :
          'text-slate-400 bg-slate-500/10'
        )}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'} {change}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-100 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </Card>
)

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 bg-slate-700/30 rounded-2xl mb-4 text-slate-500">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
)

// ─── Table ────────────────────────────────────────────────────────────────────
interface TableProps {
  headers: string[]
  children: React.ReactNode
  className?: string
}

export const Table = ({ headers, children, className }: TableProps) => (
  <div className={cn('overflow-x-auto', className)}>
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-700/50">
          {headers.map((h) => (
            <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-700/30">{children}</tbody>
    </table>
  </div>
)

export const Tr = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <tr onClick={onClick} className={cn('hover:bg-slate-700/20 transition-colors', onClick && 'cursor-pointer', className)}>
    {children}
  </tr>
)

export const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3.5 text-sm text-slate-300', className)}>{children}</td>
)

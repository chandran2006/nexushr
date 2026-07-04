import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

export interface NavItem {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  badge?: string | number
}

interface RoleSidebarProps {
  items: NavItem[]
  accentColor?: string
  logoGradient?: string
  sectionLabel?: string
}

export default function RoleSidebar({ items, accentColor = 'blue', logoGradient = 'from-blue-500 to-violet-600', sectionLabel }: RoleSidebarProps) {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleCollapse } = useUIStore()
  const navigate = useNavigate()

  const accentMap: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-400 border-l-2 border-blue-500',
    red: 'bg-red-500/15 text-red-400 border-l-2 border-red-500',
    violet: 'bg-violet-500/15 text-violet-400 border-l-2 border-violet-500',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-500',
    amber: 'bg-amber-500/15 text-amber-400 border-l-2 border-amber-500',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-l-2 border-cyan-500',
    rose: 'bg-rose-500/15 text-rose-400 border-l-2 border-rose-500',
    indigo: 'bg-indigo-500/15 text-indigo-400 border-l-2 border-indigo-500',
  }
  const activeClass = accentMap[accentColor] ?? accentMap.blue

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-40 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${logoGradient} flex items-center justify-center`}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">NexusHR</p>
                {sectionLabel && <p className="text-xs text-slate-500">{sectionLabel}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${logoGradient} flex items-center justify-center mx-auto`}>
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button onClick={toggleCollapse} className={cn('p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors', sidebarCollapsed && 'hidden')}>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {items.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive ? `${activeClass} pl-[10px]` : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                sidebarCollapsed && 'justify-center px-2'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 truncate">
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {badge !== undefined && !sidebarCollapsed && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {sidebarCollapsed && (
        <button onClick={toggleCollapse} className="mx-auto mb-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <div className="border-t border-slate-800 p-3">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="sm" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role?.replace(/_/g, ' ')}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}

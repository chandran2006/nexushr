import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Clock, DollarSign, TrendingUp, Brain,
  Briefcase, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, FileText, Shield, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/leaves', icon: FileText, label: 'Leave' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/recruitment', icon: Briefcase, label: 'Recruitment' },
  { to: '/ai', icon: Brain, label: 'AI Assistant' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

const adminItems = [
  { to: '/departments', icon: Building2, label: 'Departments' },
  { to: '/audit', icon: Shield, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleCollapse } = useUIStore()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN'

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
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">NexusHR</p>
                <p className="text-xs text-slate-500">Amdox Technologies</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors',
            sidebarCollapsed && 'hidden'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border-l-2 border-blue-500 pl-[10px]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                sidebarCollapsed && 'justify-center px-2'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className={cn('pt-4 pb-2', sidebarCollapsed && 'hidden')}>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3">Admin</p>
            </div>
            {!sidebarCollapsed && <div className="border-t border-slate-800 mb-2" />}
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-500/15 text-blue-400 border-l-2 border-blue-500 pl-[10px]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60',
                    sidebarCollapsed && 'justify-center px-2'
                  )
                }
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Collapse toggle when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={toggleCollapse}
          className="mx-auto mb-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* User */}
      <div className="border-t border-slate-800 p-3">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="sm" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
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

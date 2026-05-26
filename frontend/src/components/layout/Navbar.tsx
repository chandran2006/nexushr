import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, Sun, Moon, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar, Badge } from '@/components/ui'
import api from '@/lib/api'
import { timeAgo } from '@/lib/utils'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUIStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.get('/notifications/unread-count').then(r => r.data.data),
    refetchInterval: 30000,
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => api.get('/notifications?page=0&size=5').then(r => r.data.data),
    enabled: notifOpen,
  })

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-4 gap-4"
      style={{ paddingLeft: sidebarCollapsed ? '88px' : '272px' }}
    >
      <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employees, reports..."
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {(unreadData?.count ?? 0) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="font-semibold text-slate-100">Notifications</h3>
                {(unreadData?.count ?? 0) > 0 && <Badge variant="blue">{unreadData!.count} new</Badge>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {(notifData?.content?.length ?? 0) > 0 ? (
                  notifData.content.map((n: any) => (
                    <div key={n.id} className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${!n.read ? 'bg-blue-500/5' : ''}`}>
                      <p className="text-sm font-medium text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">No notifications</div>
                )}
              </div>
              <div className="p-3 border-t border-slate-700">
                <button onClick={() => { navigate('/notifications'); setNotifOpen(false) }}
                  className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-200 leading-none">{user?.firstName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-700">
                <p className="text-sm font-semibold text-slate-100">{user?.fullName}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <div className="p-1">
                {[
                  { icon: User, label: 'My Profile', action: () => navigate('/profile') },
                  { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} onClick={() => { action(); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
                <div className="border-t border-slate-700 mt-1 pt-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(profileOpen || notifOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setProfileOpen(false); setNotifOpen(false) }} />
      )}
    </header>
  )
}

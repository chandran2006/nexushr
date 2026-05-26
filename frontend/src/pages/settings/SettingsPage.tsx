import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Card, Button, Input, Avatar } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '',
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-3 h-fit">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Profile Information</h2>
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-700/50">
                <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="xl" />
                <div>
                  <p className="font-semibold text-slate-200">{user?.fullName}</p>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.role?.replace(/_/g, ' ')} · {user?.employeeId}</p>
                  <Button variant="secondary" size="sm" className="mt-3">Change Photo</Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={profile.firstName}
                    onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                  <Input label="Last Name" value={profile.lastName}
                    onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                </div>
                <Input label="Email Address" type="email" value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                <Input label="Phone Number" value={profile.phoneNumber}
                  onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="+1 (555) 000-0000" />
                <div className="flex justify-end pt-2">
                  <Button icon={<Save className="w-4 h-4" />}>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Leave Request Updates', desc: 'Get notified when your leave is approved or rejected' },
                  { label: 'Payslip Ready', desc: 'Receive notification when your payslip is generated' },
                  { label: 'Performance Reviews', desc: 'Alerts for upcoming and completed reviews' },
                  { label: 'System Announcements', desc: 'Important company-wide announcements' },
                  { label: 'Email Notifications', desc: 'Receive notifications via email' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500" />
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/40 rounded-xl">
                  <h3 className="font-medium text-slate-200 mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                    <Button size="sm">Update Password</Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/40 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-200">Two-Factor Authentication</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security</p>
                    </div>
                    <Button variant="secondary" size="sm">Enable 2FA</Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/40 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-200">Active Sessions</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Manage your active login sessions</p>
                    </div>
                    <Button variant="danger" size="sm">Revoke All</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Dark', 'Light', 'System'].map(theme => (
                      <button key={theme}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                          theme === 'Dark' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}>
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'].map(color => (
                      <button key={color} className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-slate-800 ring-transparent hover:ring-white transition-all"
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

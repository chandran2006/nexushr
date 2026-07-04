import { motion } from 'framer-motion'
import {
  Users, Shield, Activity, Server, AlertTriangle,
  Globe, Lock, Database, Cpu, ArrowUpRight, CheckCircle, Clock,
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, StatCard, Badge, Table, Tr, Td } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const API_STATS = [
  { hour: '00', requests: 120 }, { hour: '04', requests: 45 }, { hour: '08', requests: 890 },
  { hour: '12', requests: 1240 }, { hour: '16', requests: 980 }, { hour: '20', requests: 560 },
]
const USER_GROWTH = [
  { month: 'Jan', users: 210 }, { month: 'Feb', users: 224 }, { month: 'Mar', users: 238 },
  { month: 'Apr', users: 245 }, { month: 'May', users: 251 }, { month: 'Jun', users: 260 },
]
const SYSTEM = [
  { name: 'API Server',    status: 'HEALTHY',  uptime: '99.98%', latency: '42ms' },
  { name: 'Database',      status: 'HEALTHY',  uptime: '99.99%', latency: '8ms'  },
  { name: 'Redis Cache',   status: 'HEALTHY',  uptime: '100%',   latency: '2ms'  },
  { name: 'AI Service',    status: 'DEGRADED', uptime: '97.2%',  latency: '320ms'},
  { name: 'Email Service', status: 'HEALTHY',  uptime: '99.5%',  latency: '180ms'},
]
const AUDIT = [
  { id: 1, user: 'hradmin@nexushr.com',  action: 'USER_CREATED',     resource: 'Employee #1042',  time: '2m ago',  status: 'SUCCESS' },
  { id: 2, user: 'hradmin@nexushr.com',  action: 'PAYROLL_APPROVED', resource: 'Jun 2025 Payroll', time: '15m ago', status: 'SUCCESS' },
  { id: 3, user: 'finance@nexushr.com',  action: 'REPORT_EXPORTED',  resource: 'Tax Report Q2',   time: '1h ago',  status: 'SUCCESS' },
  { id: 4, user: '192.168.1.45',         action: 'LOGIN_FAILED',     resource: 'Auth Service',     time: '2h ago',  status: 'FAILED'  },
  { id: 5, user: 'manager@nexushr.com',  action: 'LEAVE_APPROVED',   resource: 'Leave #882',       time: '3h ago',  status: 'SUCCESS' },
  { id: 6, user: 'admin@nexushr.com',    action: 'ROLE_CHANGED',     resource: 'User #205',        time: '5h ago',  status: 'SUCCESS' },
]

export default function SuperAdminDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Super Admin Console</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.firstName}. All systems operational.</p>
      </motion.div>

      {/* KPIs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users"      value="260"   change="9 new today"  changeType="up"      icon={<Users className="w-5 h-5" />}    gradient="bg-gradient-to-br from-red-500 to-rose-600"    subtitle="Platform-wide" />
        <StatCard title="Active Sessions"  value="284"   change="↑ 18%"        changeType="up"      icon={<Activity className="w-5 h-5" />} gradient="bg-gradient-to-br from-orange-500 to-red-500"  subtitle="Right now" />
        <StatCard title="API Requests"     value="48.2K" change="Today"         changeType="neutral" icon={<Globe className="w-5 h-5" />}    gradient="bg-gradient-to-br from-slate-600 to-slate-700" subtitle="Avg 320ms" />
        <StatCard title="Security Alerts"  value="3"     change="2 resolved"   changeType="down"    icon={<Shield className="w-5 h-5" />}   gradient="bg-gradient-to-br from-amber-500 to-orange-600" subtitle="Needs review" />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">API Traffic</h3>
                <p className="text-xs text-slate-500 mt-0.5">Requests per hour today</p>
              </div>
              <Badge variant="red">Live</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={API_STATS}>
                <defs>
                  <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour"     tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis                    tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={2} fill="url(#apiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <Server className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-100">System Health</h3>
            </div>
            <div className="space-y-3">
              {SYSTEM.map(s => (
                <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    {s.status === 'HEALTHY'
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-sm text-slate-300">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-400">{s.latency}</p>
                    <p className="text-xs text-slate-600">{s.uptime}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* User Growth + Audit */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
          <Card className="p-6 h-full">
            <h3 className="font-semibold text-slate-100 mb-1">User Growth</h3>
            <p className="text-xs text-slate-400 mb-4">Total registered users (6 months)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={USER_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="users" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Departments', value: '8',      icon: '🏢' },
                { label: 'Active Roles', value: '8',     icon: '🔑' },
                { label: 'Payroll / Mo', value: '$2.4M', icon: '💰' },
                { label: 'AI Queries',   value: '1,284', icon: '🤖' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-slate-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-100">Audit Log</h3>
              </div>
              <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <Table headers={['User', 'Action', 'Resource', 'Time', 'Status']}>
              {AUDIT.map(log => (
                <Tr key={log.id}>
                  <Td><span className="font-mono text-xs text-slate-400">{log.user}</span></Td>
                  <Td><span className="font-mono text-xs text-slate-300">{log.action}</span></Td>
                  <Td className="text-slate-400 text-xs">{log.resource}</Td>
                  <Td className="text-slate-500 text-xs">{log.time}</Td>
                  <Td><Badge variant={log.status === 'SUCCESS' ? 'green' : 'red'}>{log.status}</Badge></Td>
                </Tr>
              ))}
            </Table>
          </Card>
        </motion.div>
      </div>

      {/* Resource Usage */}
      <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-red-400" />
            <h3 className="font-semibold text-slate-100">Server Resource Usage</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[{ label: 'CPU', value: 34, color: '#ef4444' }, { label: 'Memory', value: 61, color: '#f97316' }, { label: 'Storage', value: 48, color: '#eab308' }].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
                      strokeDasharray={`${value * 2.01} 201`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-100">{value}%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

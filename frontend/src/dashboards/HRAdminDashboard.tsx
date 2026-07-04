import { motion } from 'framer-motion'
import { Users, Clock, DollarSign, TrendingUp, Briefcase, CheckCircle, XCircle, ArrowUpRight, Brain, FileText, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, StatCard, Avatar, Badge, Progress } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const HEADCOUNT = [
  { month: 'Jan', count: 210 }, { month: 'Feb', count: 218 }, { month: 'Mar', count: 229 },
  { month: 'Apr', count: 238 }, { month: 'May', count: 248 }, { month: 'Jun', count: 260 },
]
const DEPT_DIST = [
  { name: 'Engineering', value: 85 }, { name: 'Sales', value: 62 },
  { name: 'HR', value: 24 },          { name: 'Finance', value: 31 },
  { name: 'Marketing', value: 34 },   { name: 'Operations', value: 24 },
]
const LEAVE_REQUESTS = [
  { name: 'Sarah Johnson', type: 'Annual',    days: 5,  dept: 'Engineering' },
  { name: 'Mike Chen',     type: 'Sick',      days: 2,  dept: 'Sales'       },
  { name: 'Priya Patel',   type: 'Maternity', days: 90, dept: 'HR'          },
  { name: 'Tom Harris',    type: 'Emergency', days: 3,  dept: 'Finance'     },
]

export default function HRAdminDashboard() {
  const { user } = useAuthStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">HR Operations Center</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">HR Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">{greeting}, {user?.firstName}. Here's your workforce overview.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value="260" change="9 new this month" changeType="up"
          icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-600" subtitle="248 active" />
        <StatCard title="Attendance Rate" value="92%" change="239 present" changeType="up"
          icon={<Clock className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" subtitle="8 late today" />
        <StatCard title="Pending Leaves" value="4" change="Needs review" changeType="neutral"
          icon={<FileText className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-orange-500" subtitle="12 approved this month" />
        <StatCard title="Open Positions" value="7" change="34 candidates" changeType="neutral"
          icon={<Briefcase className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-purple-600" subtitle="3 hired this month" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">Workforce Growth</h3>
                <p className="text-xs text-slate-400 mt-0.5">Headcount trend over 6 months</p>
              </div>
              <Badge variant="blue"><TrendingUp className="w-3 h-3 mr-1" />+9 this month</Badge>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={HEADCOUNT}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#hrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <h3 className="font-semibold text-slate-100 mb-1">Department Split</h3>
            <p className="text-xs text-slate-400 mb-4">Employee distribution</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={DEPT_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {DEPT_DIST.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {DEPT_DIST.slice(0, 4).map((dept, i) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-400">{dept.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-300">{dept.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">Pending Leave Approvals</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-3">
              {LEAVE_REQUESTS.map((req, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <Avatar name={req.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{req.name}</p>
                    <p className="text-xs text-slate-400">{req.type} Leave · {req.days} days · {req.dept}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"><XCircle className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 mb-4">Payroll Status</h3>
            <div className="text-2xl font-bold text-slate-100 mb-1">$2,350,000</div>
            <p className="text-xs text-slate-400 mb-3">This month's total payroll</p>
            <div className="space-y-2">
              {[{ label: 'Processed', value: 92, color: 'green' as const }, { label: 'Pending', pct: 8 }].slice(0, 1).map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{label}</span><span className="text-emerald-400 font-medium">{value}%</span></div>
                  <Progress value={value!} color={color} size="sm" />
                </div>
              ))}
              <div className="flex justify-between text-xs mt-2"><span className="text-slate-400">Pending payrolls</span><span className="text-amber-400 font-medium">2</span></div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-slate-100">AI Workforce Insights</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { text: '4.2% attrition risk detected this quarter', color: 'text-red-400' },
                { text: '3 employees flagged for potential burnout', color: 'text-amber-400' },
                { text: 'Engineering dept. understaffed by 15%',     color: 'text-blue-400' },
              ].map(({ text, color }, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
                  <p className="text-xs text-slate-300">{text}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Full AI analysis <ArrowUpRight className="w-3 h-3" /></button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

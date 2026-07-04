import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Brain, Target, ArrowUpRight, Award, BarChart2, Zap } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, StatCard, Badge, Progress } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const FORECAST = [
  { month: 'Jul', headcount: 265, payroll: 2.5  }, { month: 'Aug', headcount: 271, payroll: 2.55 },
  { month: 'Sep', headcount: 278, payroll: 2.6  }, { month: 'Oct', headcount: 285, payroll: 2.68 },
  { month: 'Nov', headcount: 290, payroll: 2.72 }, { month: 'Dec', headcount: 298, payroll: 2.80 },
]
const DEPT_PERF = [
  { dept: 'Eng',     score: 88 }, { dept: 'Sales',   score: 76 },
  { dept: 'HR',      score: 82 }, { dept: 'Finance', score: 91 },
  { dept: 'Mktg',   score: 74 }, { dept: 'Ops',     score: 79 },
]
const ATTRITION = [
  { name: 'Engineering', risk: 12, employees: 85 },
  { name: 'Sales',       risk: 28, employees: 62 },
  { name: 'Marketing',   risk: 18, employees: 34 },
  { name: 'Operations',  risk: 8,  employees: 41 },
]
const REVENUE_TREND = [
  { month: 'Jan', revenue: 4.2 }, { month: 'Feb', revenue: 4.5 },
  { month: 'Mar', revenue: 4.8 }, { month: 'Apr', revenue: 4.6 },
  { month: 'May', revenue: 5.1 }, { month: 'Jun', revenue: 5.4 },
]
const HEALTH_METRICS = [
  { label: 'Employee Satisfaction', value: 84, color: 'green'  as const },
  { label: 'Retention Rate',        value: 91, color: 'blue'   as const },
  { label: 'Goal Completion',       value: 76, color: 'purple' as const },
  { label: 'Hiring Velocity',       value: 68, color: 'yellow' as const },
]

export default function ExecutiveDashboard() {
  const { user } = useAuthStore()
  const healthScore = Math.round(HEALTH_METRICS.reduce((a, m) => a + m.value, 0) / HEALTH_METRICS.length)

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Executive Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Executive Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome, {user?.firstName}. Company health score: <span className="text-cyan-400 font-semibold">{healthScore}/100</span></p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Workforce"  value="260"                   change="4.2% attrition"  changeType="up"      icon={<Users className="w-5 h-5" />}      gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard title="Monthly Payroll"  value={formatCurrency(2400000)} change="+2.1% growth"  changeType="up"      icon={<DollarSign className="w-5 h-5" />}  gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Open Positions"   value="7"                     change="3 hired"          changeType="up"      icon={<Target className="w-5 h-5" />}      gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard title="Company Health"   value={`${healthScore}/100`}  change="Good standing"   changeType="up"      icon={<Award className="w-5 h-5" />}       gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">Workforce Forecast</h3>
                <p className="text-xs text-slate-400 mt-0.5">Headcount & payroll projection (H2 2025)</p>
              </div>
              <Badge variant="cyan"><Zap className="w-3 h-3 mr-1" />AI Forecast</Badge>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart data={FORECAST}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month"  tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"   tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar  yAxisId="left"  dataKey="headcount" fill="#06b6d4" fillOpacity={0.6} radius={[4, 4, 0, 0]} name="Headcount" />
                <Line yAxisId="right" type="monotone" dataKey="payroll" stroke="#f59e0b" strokeWidth={2} dot={false} name="Payroll ($M)" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">Company Health</h3>
            </div>
            <div className="flex items-center justify-center my-4">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="10"
                    strokeDasharray={`${healthScore * 2.51} 251`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-100">{healthScore}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {HEALTH_METRICS.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-medium">{value}%</span>
                  </div>
                  <Progress value={value} color={color} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.35 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">Revenue per Employee</h3>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month"    tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}M`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v: any) => `$${v}M`} />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revGrad)" name="Revenue ($M)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {[{ label: 'Revenue / Employee', value: '$20.8K' }, { label: 'Target', value: '$22K' }, { label: 'YTD Revenue', value: '$28.6M' }].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">Department Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DEPT_PERF} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="score" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
          <Card className="p-6 h-full bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">AI Attrition Prediction</h3>
              <Badge variant="cyan" className="ml-auto">GPT-4o</Badge>
            </div>
            <div className="space-y-3">
              {ATTRITION.map(dept => (
                <div key={dept.name} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">{dept.name}</span>
                    <Badge variant={dept.risk > 20 ? 'red' : dept.risk > 12 ? 'yellow' : 'green'}>{dept.risk}% risk</Badge>
                  </div>
                  <Progress value={dept.risk} max={40} color={dept.risk > 20 ? 'red' : dept.risk > 12 ? 'yellow' : 'green'} size="sm" />
                  <p className="text-xs text-slate-500 mt-1">{dept.employees} employees</p>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Full AI analysis <ArrowUpRight className="w-3 h-3" />
            </button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

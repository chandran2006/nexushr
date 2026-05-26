import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Clock, DollarSign, TrendingUp, UserPlus, AlertTriangle,
  Briefcase, CheckCircle, Calendar, ArrowUpRight,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, StatCard, Avatar, Badge, Skeleton, Progress } from '@/components/ui'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import type { DashboardData } from '@/types'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data.data),
    refetchInterval: 60000,
  })

  if (isLoading) return <DashboardSkeleton />

  const d = data!

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Employees"
          value={d.employeeStats.totalEmployees.toLocaleString()}
          change={`${d.employeeStats.newHiresThisMonth} new`}
          changeType="up"
          icon={<Users className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`${d.employeeStats.activeEmployees} active`}
        />
        <StatCard
          title="Present Today"
          value={`${d.attendanceStats.presentToday}`}
          change={`${d.attendanceStats.attendanceRate}%`}
          changeType="up"
          icon={<Clock className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          subtitle={`${d.attendanceStats.lateToday} late, ${d.attendanceStats.absentToday} absent`}
        />
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(d.payrollStats.totalPayrollThisMonth)}
          change={`${d.payrollStats.payrollGrowth >= 0 ? '+' : ''}${d.payrollStats.payrollGrowth}%`}
          changeType={d.payrollStats.payrollGrowth >= 0 ? 'up' : 'down'}
          icon={<DollarSign className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          subtitle={`${d.payrollStats.pendingPayrolls} pending`}
        />
        <StatCard
          title="Open Positions"
          value={d.recruitmentStats.openPositions.toString()}
          change={`${d.recruitmentStats.totalCandidates} candidates`}
          changeType="neutral"
          icon={<Briefcase className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          subtitle={`${d.recruitmentStats.interviewsScheduled} interviews`}
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Headcount Trend */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-100">Headcount Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Employee growth over 6 months</p>
              </div>
              <Badge variant="blue">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{d.employeeStats.newHiresThisMonth} this month
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={d.headcountTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Department Distribution */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-slate-100">By Department</h3>
              <p className="text-xs text-slate-400 mt-0.5">Employee distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={d.departmentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {d.departmentDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {d.departmentDistribution.slice(0, 4).map((dept, i) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-400">{dept.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-300">{dept.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Hires */}
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">Recent Hires</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {d.recentHires.slice(0, 5).map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <Avatar name={emp.fullName} src={emp.profileImageUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{emp.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{emp.jobTitle} · {emp.department?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${getStatusColor(emp.status)}`}>{emp.status}</span>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(emp.hireDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 mb-4">Leave Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm text-slate-400">Pending</span>
                </div>
                <span className="text-sm font-semibold text-slate-200">{d.leaveStats.pendingRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-slate-400">Approved</span>
                </div>
                <span className="text-sm font-semibold text-slate-200">{d.leaveStats.approvedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm text-slate-400">Rejected</span>
                </div>
                <span className="text-sm font-semibold text-slate-200">{d.leaveStats.rejectedThisMonth}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 mb-4">Attendance Today</h3>
            <div className="space-y-3">
              {[
                { label: 'Present', value: d.attendanceStats.presentToday, color: 'green' as const, total: d.employeeStats.totalEmployees },
                { label: 'Late', value: d.attendanceStats.lateToday, color: 'yellow' as const, total: d.employeeStats.totalEmployees },
                { label: 'Absent', value: d.attendanceStats.absentToday, color: 'red' as const, total: d.employeeStats.totalEmployees },
              ].map(({ label, value, color, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-medium">{value}</span>
                  </div>
                  <Progress value={Number(value)} max={Number(total)} color={color} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-100">AI Insights</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              {d.employeeStats.attritionRate}% attrition rate detected. 3 employees flagged as high risk.
            </p>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              View AI analysis <ArrowUpRight className="w-3 h-3" />
            </button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton className="xl:col-span-2 h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { Clock, FileText, DollarSign, Target, Brain, CheckCircle, Calendar, ArrowUpRight, Smile } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, StatCard, Badge, Progress, Avatar } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const ATTENDANCE_TREND = [
  { week: 'W1', hours: 40 }, { week: 'W2', hours: 38 }, { week: 'W3', hours: 42 },
  { week: 'W4', hours: 39 }, { week: 'W5', hours: 41 },
]
const GOALS = [
  { title: 'Complete React certification',       progress: 75,  due: 'Jun 30' },
  { title: 'Lead Q2 sprint planning',            progress: 100, due: 'May 15' },
  { title: 'Improve code review turnaround',     progress: 40,  due: 'Jul 15' },
  { title: 'Onboard 2 junior engineers',         progress: 60,  due: 'Aug 1'  },
]
const ACTIVITY = [
  { icon: '✅', text: 'Leave approved for Jun 10–12',              time: '2h ago'  },
  { icon: '💰', text: 'May payslip is ready to download',          time: '1d ago'  },
  { icon: '🎯', text: 'Goal "Lead Q2 sprint" marked complete',     time: '2d ago'  },
  { icon: '📋', text: 'Performance review scheduled for Jul 5',    time: '3d ago'  },
  { icon: '🏆', text: 'Employee of the month — May 2025',          time: '5d ago'  },
]

export default function EmployeeDashboard() {
  const { user } = useAuthStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
          <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="lg" />
          <div>
            <p className="text-slate-400 text-sm">{greeting} 👋</p>
            <h1 className="text-2xl font-bold text-slate-100">{user?.firstName} {user?.lastName}</h1>
            <p className="text-sm text-slate-400 mt-0.5">Employee · {user?.employeeId || 'EMP-001'}</p>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Engagement: 88%</span>
            </div>
            <Badge variant="green">● Active</Badge>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="This Month Hours" value="162h"                  change="On track"   changeType="up"      icon={<Clock className="w-5 h-5" />}      gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Annual Leave Left" value="12 days"              change="5 used"     changeType="neutral" icon={<Calendar className="w-5 h-5" />}    gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Goals Progress"   value="72%"                   change="2 completed" changeType="up"     icon={<Target className="w-5 h-5" />}      gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard title="Last Payslip"     value={formatCurrency(4850)}  change="May 2025"   changeType="neutral" icon={<DollarSign className="w-5 h-5" />}  gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">My Attendance</h3>
                <p className="text-xs text-slate-400 mt-0.5">Hours worked per week</p>
              </div>
              <Badge variant="green">96% rate</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ATTENDANCE_TREND}>
                <defs>
                  <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week"    tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[30, 50]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} fill="url(#empGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <h3 className="font-semibold text-slate-100 mb-5">Leave Balance</h3>
            <div className="space-y-4">
              {[
                { type: 'Annual', used: 5,  total: 17, color: 'blue'   as const },
                { type: 'Sick',   used: 2,  total: 10, color: 'red'    as const },
                { type: 'Study',  used: 0,  total: 5,  color: 'purple' as const },
              ].map(({ type, used, total, color }) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{type}</span>
                    <span className="text-slate-400">{total - used} / {total} days left</span>
                  </div>
                  <Progress value={total - used} max={total} color={color} size="md" />
                </div>
              ))}
            </div>
            <button className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Apply for Leave
            </button>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">My Goals</h3>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-4">
              {GOALS.map((goal) => (
                <div key={goal.title} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-slate-200 flex-1 pr-4">{goal.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {goal.progress === 100 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      <Badge variant={goal.progress === 100 ? 'green' : 'blue'}>{goal.progress}%</Badge>
                    </div>
                  </div>
                  <Progress value={goal.progress} color={goal.progress === 100 ? 'green' : 'blue'} size="sm" />
                  <p className="text-xs text-slate-500 mt-2">Due: {goal.due}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-slate-100">AI Assistant</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Ask anything about HR policies, benefits, or your profile.</p>
            <div className="flex gap-2">
              <input placeholder="Ask HR anything..." className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
              <button className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs font-medium">Ask</button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs text-slate-300">{item.text}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

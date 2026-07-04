import { motion } from 'framer-motion'
import { Users, Clock, Target, CheckCircle, XCircle, ArrowUpRight, Zap, Calendar, BarChart2 } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, StatCard, Avatar, Badge, Progress } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const TEAM = [
  { name: 'Alice Wang',   role: 'Engineer',    productivity: 94, attendance: 98, goals: 3, done: 2 },
  { name: 'Bob Martinez', role: 'Designer',    productivity: 82, attendance: 90, goals: 4, done: 3 },
  { name: 'Carol Smith',  role: 'Analyst',     productivity: 71, attendance: 85, goals: 2, done: 1 },
  { name: 'David Kim',    role: 'Backend Dev', productivity: 88, attendance: 95, goals: 5, done: 4 },
  { name: 'Eva Brown',    role: 'QA Engineer', productivity: 79, attendance: 92, goals: 3, done: 2 },
]
const RADAR_DATA = [
  { subject: 'Productivity', A: 83 }, { subject: 'Attendance', A: 92 },
  { subject: 'Goals',        A: 76 }, { subject: 'Quality',    A: 84 },
  { subject: 'Collab',       A: 90 },
]
const WEEKLY_HOURS = [
  { day: 'Mon', hours: 8.2 }, { day: 'Tue', hours: 7.8 }, { day: 'Wed', hours: 8.5 },
  { day: 'Thu', hours: 7.2 }, { day: 'Fri', hours: 6.9 },
]
const LEAVE_REQUESTS = [
  { name: 'Bob Martinez', type: 'Annual', days: 2 },
  { name: 'Eva Brown',    type: 'Sick',   days: 1 },
]

export default function ManagerDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Team Management</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Manager Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Hey {user?.firstName}, your team is performing well today.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Team Size"        value="5"   change="All active"        changeType="up"      icon={<Users className="w-5 h-5" />}    gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard title="Avg Productivity" value="83%" change="+5% vs last week"  changeType="up"      icon={<Zap className="w-5 h-5" />}      gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Goals In Progress" value="17" change="12 on track"       changeType="up"      icon={<Target className="w-5 h-5" />}   gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard title="Pending Leaves"   value="2"   change="Needs review"      changeType="neutral" icon={<Calendar className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">Team Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Team" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">Avg Hours Worked</h3>
                <p className="text-xs text-slate-400 mt-0.5">Team average this week</p>
              </div>
              <Badge variant="cyan">This Week</Badge>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={WEEKLY_HOURS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day"   tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="hours" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-100">Team Overview</h3>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {TEAM.map((member) => (
              <div key={member.name} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/20 transition-colors">
                <Avatar name={member.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Productivity</p>
                    <p className={`text-sm font-semibold ${member.productivity >= 85 ? 'text-emerald-400' : member.productivity >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{member.productivity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Attendance</p>
                    <p className="text-sm font-semibold text-slate-300">{member.attendance}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Goals</p>
                    <p className="text-sm font-semibold text-slate-300">{member.done}/{member.goals}</p>
                  </div>
                </div>
                <div className="w-24 hidden xl:block">
                  <Progress value={member.productivity} color={member.productivity >= 85 ? 'green' : member.productivity >= 70 ? 'yellow' : 'red'} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
        <Card className="p-6">
          <h3 className="font-semibold text-slate-100 mb-4">Pending Leave Requests</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEAVE_REQUESTS.map((req, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-amber-500/20">
                <Avatar name={req.name} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{req.name}</p>
                  <p className="text-xs text-slate-400">{req.type} · {req.days} day{req.days > 1 ? 's' : ''}</p>
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
    </div>
  )
}

import { motion } from 'framer-motion'
import { Users, Clock, FileText, CheckCircle, XCircle, ArrowUpRight, Star, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, StatCard, Avatar, Badge, Progress } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const ATTENDANCE = [
  { day: 'Mon', present: 42, absent: 3 }, { day: 'Tue', present: 44, absent: 1 },
  { day: 'Wed', present: 40, absent: 5 }, { day: 'Thu', present: 43, absent: 2 },
  { day: 'Fri', present: 38, absent: 7 },
]
const ENGAGEMENT_TREND = [
  { month: 'Jan', score: 74 }, { month: 'Feb', score: 76 }, { month: 'Mar', score: 79 },
  { month: 'Apr', score: 77 }, { month: 'May', score: 81 }, { month: 'Jun', score: 83 },
]
const TEAM = [
  { name: 'Alice Wang',    role: 'Senior Engineer',  engagement: 92, status: 'ACTIVE'   },
  { name: 'Bob Martinez',  role: 'Product Designer', engagement: 78, status: 'ACTIVE'   },
  { name: 'Carol Smith',   role: 'Data Analyst',     engagement: 65, status: 'ON_LEAVE' },
  { name: 'David Kim',     role: 'Backend Dev',      engagement: 88, status: 'ACTIVE'   },
  { name: 'Eva Brown',     role: 'QA Engineer',      engagement: 71, status: 'ACTIVE'   },
]
const PENDING = [
  { name: 'Carol Smith',  type: 'Annual', days: 3 },
  { name: 'Bob Martinez', type: 'Sick',   days: 1 },
]

export default function HRManagerDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Department Management</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">HR Manager Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Hello, {user?.firstName}. Your department at a glance.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Dept. Employees" value="47"  change="+2 this month"    changeType="up"      icon={<Users className="w-5 h-5" />}    gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard title="Attendance Today" value="91%" change="43 present"       changeType="up"      icon={<Clock className="w-5 h-5" />}    gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Pending Approvals" value="2" change="Needs action"      changeType="neutral" icon={<FileText className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <StatCard title="Avg Engagement"  value="81%" change="+3% vs last month" changeType="up"      icon={<Star className="w-5 h-5" />}     gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">Weekly Attendance</h3>
                <p className="text-xs text-slate-400 mt-0.5">Department attendance this week</p>
              </div>
              <Badge variant="purple">This Week</Badge>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={ATTENDANCE} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day"     tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis                   tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="present" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent"  fill="#334155" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">Leave Requests</h3>
              <Badge variant="yellow">{PENDING.length} pending</Badge>
            </div>
            <div className="space-y-3">
              {PENDING.map((req, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={req.name} size="xs" />
                      <span className="text-sm font-medium text-slate-200">{req.name}</span>
                    </div>
                    <Badge variant="yellow">{req.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{req.days} day{req.days > 1 ? 's' : ''} requested</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs font-medium text-slate-400 mb-3">Engagement Trend (6 months)</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={ENGAGEMENT_TREND}>
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-100">Team Engagement Scores</h3>
            <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              Full report <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {TEAM.map((member) => (
              <div key={member.name} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Engagement</span>
                  <span className={`font-semibold ${member.engagement >= 80 ? 'text-emerald-400' : member.engagement >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                    {member.engagement}%
                  </span>
                </div>
                <Progress value={member.engagement} color={member.engagement >= 80 ? 'green' : member.engagement >= 65 ? 'yellow' : 'red'} size="sm" />
                <div className="mt-2">
                  <Badge variant={member.status === 'ACTIVE' ? 'green' : 'yellow'}>{member.status.replace('_', ' ')}</Badge>
                </div>
                {member.engagement < 70 && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">Needs attention</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

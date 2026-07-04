import { motion } from 'framer-motion'
import { Briefcase, Users, Calendar, TrendingUp, ArrowUpRight, Clock, CheckCircle, Star, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, StatCard, Avatar, Badge, Table, Tr, Td } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const PIPELINE = [
  { stage: 'Applied',   count: 142, color: '#3b82f6' },
  { stage: 'Screened',  count: 89,  color: '#8b5cf6' },
  { stage: 'Interview', count: 34,  color: '#f59e0b' },
  { stage: 'Offer',     count: 12,  color: '#10b981' },
  { stage: 'Hired',     count: 8,   color: '#06b6d4' },
]
const HIRING_TREND = [
  { month: 'Jan', hired: 4, target: 8 }, { month: 'Feb', hired: 6, target: 8 },
  { month: 'Mar', hired: 8, target: 8 }, { month: 'Apr', hired: 5, target: 8 },
  { month: 'May', hired: 9, target: 8 }, { month: 'Jun', hired: 3, target: 8 },
]
const CANDIDATES = [
  { name: 'James Wilson',  role: 'Senior Engineer',  stage: 'INTERVIEW', rating: 4, date: 'Jun 10' },
  { name: 'Aisha Patel',   role: 'Product Manager',  stage: 'OFFER',     rating: 5, date: 'Jun 11' },
  { name: 'Carlos Rivera', role: 'Data Scientist',   stage: 'SCREENED',  rating: 3, date: 'Jun 12' },
  { name: 'Mei Zhang',     role: 'UX Designer',      stage: 'INTERVIEW', rating: 4, date: 'Jun 13' },
  { name: 'Tom Harris',    role: 'DevOps Engineer',  stage: 'APPLIED',   rating: 3, date: 'Jun 14' },
]
const INTERVIEWS = [
  { candidate: 'James Wilson', role: 'Senior Engineer',  time: 'Today 2:00 PM',    type: 'Technical' },
  { candidate: 'Mei Zhang',    role: 'UX Designer',      time: 'Today 4:30 PM',    type: 'Portfolio' },
  { candidate: 'Aisha Patel',  role: 'Product Manager',  time: 'Tomorrow 10:00 AM', type: 'Final'     },
]
const JOB_OPENINGS = [
  { title: 'Senior React Developer', dept: 'Engineering', applicants: 28, days: 12 },
  { title: 'Product Manager',        dept: 'Product',     applicants: 19, days: 8  },
  { title: 'Data Scientist',         dept: 'Analytics',   applicants: 35, days: 5  },
]
const STAGE_COLORS: Record<string, 'blue' | 'yellow' | 'green' | 'gray' | 'purple'> = {
  APPLIED: 'blue', SCREENED: 'purple', INTERVIEW: 'yellow', OFFER: 'green', HIRED: 'gray',
}

export default function RecruiterDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Talent Acquisition</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Recruiter Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Hey {user?.firstName}, you have {INTERVIEWS.length} interviews scheduled today.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Open Positions"    value="7"   change="Actively hiring" changeType="neutral" icon={<Briefcase className="w-5 h-5" />}     gradient="bg-gradient-to-br from-indigo-500 to-blue-600" />
        <StatCard title="Active Candidates" value="142" change="+18 this week"   changeType="up"      icon={<Users className="w-5 h-5" />}          gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard title="Interviews Today"  value="3"   change="2 technical"     changeType="neutral" icon={<Calendar className="w-5 h-5" />}       gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
        <StatCard title="Hired This Month"  value="3"   change="Goal: 8"         changeType="up"      icon={<CheckCircle className="w-5 h-5" />}    gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="p-6 h-full">
            <h3 className="font-semibold text-slate-100 mb-5">Hiring Pipeline</h3>
            <div className="space-y-3">
              {PIPELINE.map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{stage.stage}</span>
                    <span className="text-xs font-semibold text-slate-300">{stage.count}</span>
                  </div>
                  <div className="h-7 rounded-lg overflow-hidden bg-slate-800/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.count / 142) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                      className="h-full rounded-lg flex items-center px-2"
                      style={{ background: stage.color, opacity: 0.8 }}
                    >
                      <span className="text-xs text-white font-medium">{Math.round((stage.count / 142) * 100)}%</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700/50">
              <p className="text-xs font-medium text-slate-400 mb-3">Active Job Openings</p>
              <div className="space-y-2.5">
                {JOB_OPENINGS.map((job) => (
                  <div key={job.title} className="p-2.5 rounded-lg bg-slate-800/40">
                    <p className="text-xs font-medium text-slate-200 truncate">{job.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{job.dept} · {job.days}d ago</span>
                      <Badge variant="blue">{job.applicants} applicants</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="xl:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">Hiring Trend vs Target</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly hires (YTD)</p>
              </div>
              <Badge variant="blue"><TrendingUp className="w-3 h-3 mr-1" />+35 total hired</Badge>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={HIRING_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month"  tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis                  tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="hired"  stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} name="Hired" />
                <Line type="monotone" dataKey="target" stroke="#334155" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-slate-100">Today's Interviews</h3>
              </div>
              <Badge variant="purple">{INTERVIEWS.length} scheduled</Badge>
            </div>
            <div className="space-y-2.5">
              {INTERVIEWS.map((iv, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                  <Avatar name={iv.candidate} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{iv.candidate}</p>
                    <p className="text-xs text-slate-400">{iv.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-indigo-400">{iv.time}</p>
                    <Badge variant="purple" className="mt-1">{iv.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-100">Recent Candidates</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition-colors">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <Table headers={['Candidate', 'Role', 'Stage', 'Rating', 'Interview Date']}>
            {CANDIDATES.map(c => (
              <Tr key={c.name}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} size="xs" />
                    <span className="font-medium text-slate-200">{c.name}</span>
                  </div>
                </Td>
                <Td className="text-slate-400">{c.role}</Td>
                <Td><Badge variant={STAGE_COLORS[c.stage] || 'gray'}>{c.stage}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < c.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </Td>
                <Td className="text-slate-400">{c.date}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      </motion.div>
    </div>
  )
}

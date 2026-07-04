import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, FileText, Download, AlertCircle, ArrowUpRight, PieChart as PieIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, StatCard, Badge, Table, Tr, Td } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4']

const PAYROLL_TREND = [
  { month: 'Jan', gross: 2100000, net: 1680000 }, { month: 'Feb', gross: 2150000, net: 1720000 },
  { month: 'Mar', gross: 2200000, net: 1760000 }, { month: 'Apr', gross: 2180000, net: 1744000 },
  { month: 'May', gross: 2350000, net: 1880000 }, { month: 'Jun', gross: 2400000, net: 1920000 },
]
const DEPT_COST = [
  { name: 'Engineering', value: 820000 }, { name: 'Sales',      value: 540000 },
  { name: 'HR',          value: 280000 }, { name: 'Finance',    value: 310000 },
  { name: 'Marketing',   value: 240000 }, { name: 'Operations', value: 160000 },
]
const PAYROLL_RUNS = [
  { id: 'PR-2025-06', period: 'Jun 2025', employees: 260, gross: '$2.40M', status: 'PROCESSING' },
  { id: 'PR-2025-05', period: 'May 2025', employees: 248, gross: '$2.35M', status: 'PAID'       },
  { id: 'PR-2025-04', period: 'Apr 2025', employees: 245, gross: '$2.18M', status: 'PAID'       },
  { id: 'PR-2025-03', period: 'Mar 2025', employees: 242, gross: '$2.20M', status: 'PAID'       },
]
const TAX_SUMMARY = [
  { quarter: 'Q1', tax: 396000 }, { quarter: 'Q2', tax: 412000 },
  { quarter: 'Q3', tax: 428000 }, { quarter: 'Q4', tax: 440000 },
]

export default function FinanceDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Finance & Payroll</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Finance Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome, {user?.firstName}. Jun 2025 payroll is in progress.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Monthly Payroll" value={formatCurrency(2400000)} change="+2.1% vs last month" changeType="up"
          icon={<DollarSign className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-yellow-600" />
        <StatCard title="Tax Deductions"  value={formatCurrency(480000)}  change="20% effective rate"  changeType="neutral"
          icon={<FileText className="w-5 h-5" />}  gradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title="Pending Payrolls" value="2"                      change="Needs approval"      changeType="neutral"
          icon={<AlertCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-slate-600 to-slate-700" />
        <StatCard title="YTD Payroll"     value={formatCurrency(13380000)} change="Jan–Jun 2025"       changeType="neutral"
          icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-100">Payroll Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Gross vs Net payroll (YTD)</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={PAYROLL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v: any) => formatCurrency(Number(v))} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="gross" stroke="#f59e0b" strokeWidth={2} dot={false} name="Gross" />
                <Line type="monotone" dataKey="net"   stroke="#10b981" strokeWidth={2} dot={false} name="Net" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-slate-100">Dept. Cost</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={DEPT_COST} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                  {DEPT_COST.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v: any) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {DEPT_COST.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-400">{d.name}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-300">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div {...fadeUp} transition={{ delay: 0.35 }} className="xl:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">Payroll Runs</h3>
              <button className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">View all <ArrowUpRight className="w-3 h-3" /></button>
            </div>
            <Table headers={['Payroll ID', 'Period', 'Employees', 'Gross Amount', 'Status', 'Action']}>
              {PAYROLL_RUNS.map(p => (
                <Tr key={p.id}>
                  <Td><span className="font-mono text-xs text-slate-400">{p.id}</span></Td>
                  <Td className="font-medium text-slate-200">{p.period}</Td>
                  <Td>{p.employees}</Td>
                  <Td className="font-semibold text-slate-200">{p.gross}</Td>
                  <Td><Badge variant={p.status === 'PAID' ? 'green' : 'yellow'}>{p.status}</Badge></Td>
                  <Td>
                    <button className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </Td>
                </Tr>
              ))}
            </Table>
          </Card>
        </motion.div>

        <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
          <Card className="p-6 h-full">
            <h3 className="font-semibold text-slate-100 mb-1">Tax Summary</h3>
            <p className="text-xs text-slate-400 mb-4">Quarterly tax deductions (2025)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={TAX_SUMMARY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="quarter" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="tax" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tax" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {[{ label: 'Total Tax YTD', value: formatCurrency(1676000) }, { label: 'Avg Tax Rate', value: '20%' }, { label: 'Next Filing', value: 'Jul 31, 2025' }].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-semibold text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Download, CheckCircle, Play, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, Button, Badge, Table, Tr, Td, Skeleton, StatCard } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import type { Payroll } from '@/types'
import { useAuthStore } from '@/store/authStore'

export default function PayrollPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isFinance = ['SUPER_ADMIN', 'HR_ADMIN', 'FINANCE'].includes(user?.role || '')

  const { data: myPayrolls, isLoading } = useQuery({
    queryKey: ['payroll', 'my'],
    queryFn: () => api.get('/payroll/my?page=0&size=12').then(r => r.data.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/approve`),
    onSuccess: () => { toast.success('Payroll approved'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
  })

  const payMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/pay`),
    onSuccess: () => { toast.success('Payroll marked as paid'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
  })

  const statusVariant = (s: string): any => {
    const m: Record<string, any> = { DRAFT: 'gray', PROCESSING: 'blue', APPROVED: 'yellow', PAID: 'green', CANCELLED: 'red' }
    return m[s] || 'gray'
  }

  const payrolls: Payroll[] = myPayrolls?.content || []
  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0)
  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0)
  const totalTax = payrolls.reduce((sum, p) => sum + p.taxDeduction, 0)

  const chartData = payrolls.slice(0, 6).reverse().map(p => ({
    period: formatDate(p.payPeriodStart).slice(0, 6),
    gross: p.grossSalary,
    net: p.netSalary,
    tax: p.taxDeduction,
  }))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Payroll</h1>
          <p className="text-slate-400 text-sm mt-1">Manage salary processing and payslips</p>
        </div>
        {isFinance && (
          <Button icon={<Play className="w-4 h-4" />}>Process Payroll</Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Net (YTD)" value={formatCurrency(totalNet)}
          icon={<DollarSign className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard title="Total Gross (YTD)" value={formatCurrency(totalGross)}
          icon={<TrendingUp className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Total Tax (YTD)" value={formatCurrency(totalTax)}
          icon={<DollarSign className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
      </div>

      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-100 mb-5">Salary Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                formatter={(v: any) => formatCurrency(Number(v))}
              />
              <Bar dataKey="gross" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Gross" />
              <Bar dataKey="net" fill="#10b981" radius={[4, 4, 0, 0]} name="Net" />
              <Bar dataKey="tax" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tax" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="font-semibold text-slate-100">Payroll History</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        ) : (
          <Table headers={['Period', 'Basic Salary', 'Gross', 'Deductions', 'Net Salary', 'Status', 'Actions']}>
            {payrolls.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <p className="font-medium text-slate-200">{formatDate(p.payPeriodStart)}</p>
                  <p className="text-xs text-slate-500">to {formatDate(p.payPeriodEnd)}</p>
                </Td>
                <Td>{formatCurrency(p.basicSalary, p.currency)}</Td>
                <Td className="text-blue-400 font-medium">{formatCurrency(p.grossSalary, p.currency)}</Td>
                <Td className="text-red-400">{formatCurrency(p.taxDeduction + p.insuranceDeduction + p.otherDeductions, p.currency)}</Td>
                <Td className="text-emerald-400 font-semibold">{formatCurrency(p.netSalary, p.currency)}</Td>
                <Td><Badge variant={statusVariant(p.status)}>{p.status}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    {isFinance && p.status === 'DRAFT' && (
                      <Button size="sm" variant="secondary" onClick={() => approveMutation.mutate(p.id)}>Approve</Button>
                    )}
                    {isFinance && p.status === 'APPROVED' && (
                      <Button size="sm" variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}
                        onClick={() => payMutation.mutate(p.id)}>Mark Paid</Button>
                    )}
                    <Button size="sm" variant="ghost" icon={<Download className="w-3.5 h-3.5" />}>Slip</Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

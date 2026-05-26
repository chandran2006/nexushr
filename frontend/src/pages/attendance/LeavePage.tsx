import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Card, Button, Badge, Modal, Input, Select, Table, Tr, Td, Skeleton, EmptyState, StatCard } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import type { LeaveRequest } from '@/types'
import { useAuthStore } from '@/store/authStore'

export default function LeavePage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [applyModal, setApplyModal] = useState(false)
  const [form, setForm] = useState({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })

  const isHR = ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER'].includes(user?.role || '')

  const { data: myLeaves, isLoading } = useQuery({
    queryKey: ['leaves', 'my'],
    queryFn: () => api.get('/leaves/my?page=0&size=20').then(r => r.data.data),
  })

  const { data: pendingLeaves } = useQuery({
    queryKey: ['leaves', 'pending'],
    queryFn: () => api.get('/leaves/pending').then(r => r.data.data),
    enabled: isHR,
  })

  const applyMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/leaves/apply', data),
    onSuccess: () => {
      toast.success('Leave request submitted!')
      qc.invalidateQueries({ queryKey: ['leaves'] })
      setApplyModal(false)
      setForm({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to apply'),
  })

  const processMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.put(`/leaves/${id}/process`, { status, notes }),
    onSuccess: () => { toast.success('Leave request processed'); qc.invalidateQueries({ queryKey: ['leaves'] }) },
    onError: () => toast.error('Failed to process request'),
  })

  const statusVariant = (s: string): any => {
    const m: Record<string, any> = { PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red', CANCELLED: 'gray' }
    return m[s] || 'gray'
  }

  const leaveTypeOptions = [
    { value: 'ANNUAL', label: 'Annual Leave' },
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'MATERNITY', label: 'Maternity Leave' },
    { value: 'PATERNITY', label: 'Paternity Leave' },
    { value: 'EMERGENCY', label: 'Emergency Leave' },
    { value: 'UNPAID', label: 'Unpaid Leave' },
    { value: 'STUDY', label: 'Study Leave' },
    { value: 'BEREAVEMENT', label: 'Bereavement Leave' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Leave Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage leave requests and approvals</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setApplyModal(true)}>Apply Leave</Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Requests" value={pendingLeaves?.length || 0}
          icon={<Clock className="w-5 h-5" />} gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatCard title="My Leave Balance" value="20 days"
          icon={<CheckCircle className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard title="Sick Leave Balance" value="10 days"
          icon={<FileText className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
      </div>

      {/* Pending Approvals (HR only) */}
      {isHR && pendingLeaves?.length > 0 && (
        <Card>
          <div className="p-5 border-b border-slate-700/50">
            <h3 className="font-semibold text-slate-100">Pending Approvals</h3>
            <p className="text-xs text-slate-400 mt-0.5">{pendingLeaves.length} requests awaiting action</p>
          </div>
          <Table headers={['Employee', 'Leave Type', 'Duration', 'Reason', 'Actions']}>
            {pendingLeaves.map((leave: LeaveRequest) => (
              <Tr key={leave.id}>
                <Td>
                  <div>
                    <p className="font-medium text-slate-200">{leave.employee?.fullName}</p>
                    <p className="text-xs text-slate-500">{leave.employee?.employeeId}</p>
                  </div>
                </Td>
                <Td><Badge variant="blue">{leave.leaveType}</Badge></Td>
                <Td>
                  <p className="text-slate-300">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</p>
                  <p className="text-xs text-slate-500">{leave.totalDays} working days</p>
                </Td>
                <Td className="max-w-xs">
                  <p className="text-slate-400 text-sm truncate">{leave.reason || '—'}</p>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => processMutation.mutate({ id: leave.id, status: 'APPROVED' })}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => processMutation.mutate({ id: leave.id, status: 'REJECTED' })}>
                      Reject
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}

      {/* My Leave History */}
      <Card>
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="font-semibold text-slate-100">My Leave History</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        ) : !myLeaves?.content?.length ? (
          <EmptyState icon={<FileText className="w-10 h-10" />} title="No leave requests"
            description="You haven't applied for any leave yet"
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setApplyModal(true)}>Apply Leave</Button>} />
        ) : (
          <Table headers={['Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Applied On']}>
            {myLeaves.content.map((leave: LeaveRequest) => (
              <Tr key={leave.id}>
                <Td><Badge variant="blue">{leave.leaveType}</Badge></Td>
                <Td>{formatDate(leave.startDate)}</Td>
                <Td>{formatDate(leave.endDate)}</Td>
                <Td className="font-medium text-slate-200">{leave.totalDays}</Td>
                <Td><Badge variant={statusVariant(leave.status)}>{leave.status}</Badge></Td>
                <Td className="text-slate-400">{formatDate(leave.createdAt)}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Apply Leave Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title="Apply for Leave">
        <form onSubmit={e => { e.preventDefault(); applyMutation.mutate(form) }} className="space-y-4">
          <Select
            label="Leave Type"
            value={form.leaveType}
            onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
            options={leaveTypeOptions}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            <Input label="End Date" type="date" value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Reason</label>
            <textarea
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Provide a reason for your leave request..."
              rows={3}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setApplyModal(false)}>Cancel</Button>
            <Button type="submit" loading={applyMutation.isPending}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

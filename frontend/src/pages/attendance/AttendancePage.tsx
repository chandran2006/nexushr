import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, LogIn, LogOut, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'
import { Card, Button, Badge, StatCard, Table, Tr, Td, Skeleton } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import type { Attendance } from '@/types'

export default function AttendancePage() {
  const qc = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const { data: todayStats } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => api.get('/attendance/today').then(r => r.data.data),
    refetchInterval: 30000,
  })

  const { data: myAttendance, isLoading } = useQuery<Attendance[]>({
    queryKey: ['attendance', 'my'],
    queryFn: () => api.get(`/attendance/my?start=${thirtyDaysAgo}&end=${today}`).then(r => r.data.data),
  })

  const clockInMutation = useMutation({
    mutationFn: () => api.post('/attendance/clock-in'),
    onSuccess: () => { toast.success('Clocked in successfully!'); qc.invalidateQueries({ queryKey: ['attendance'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Clock in failed'),
  })

  const clockOutMutation = useMutation({
    mutationFn: () => api.post('/attendance/clock-out'),
    onSuccess: () => { toast.success('Clocked out successfully!'); qc.invalidateQueries({ queryKey: ['attendance'] }) },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Clock out failed'),
  })

  const todayRecord = myAttendance?.find(a => a.date === today)
  const isClockedIn = !!todayRecord?.clockIn && !todayRecord?.clockOut

  const statusVariant = (s: string): any => {
    const m: Record<string, any> = { PRESENT: 'green', ABSENT: 'red', LATE: 'yellow', HALF_DAY: 'yellow', ON_LEAVE: 'blue', HOLIDAY: 'purple', WEEKEND: 'gray' }
    return m[s] || 'gray'
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </motion.div>

      {/* Clock In/Out Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1">Today's Attendance</h3>
              <p className="text-slate-400 text-sm">
                {todayRecord?.clockIn ? `Clocked in at ${todayRecord.clockIn}` : 'Not clocked in yet'}
                {todayRecord?.clockOut && ` · Clocked out at ${todayRecord.clockOut}`}
                {todayRecord?.workHours && ` · ${todayRecord.workHours}h worked`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!todayRecord?.clockIn ? (
                <Button
                  onClick={() => clockInMutation.mutate()}
                  loading={clockInMutation.isPending}
                  icon={<LogIn className="w-4 h-4" />}
                  size="lg"
                >
                  Clock In
                </Button>
              ) : !todayRecord?.clockOut ? (
                <Button
                  variant="danger"
                  onClick={() => clockOutMutation.mutate()}
                  loading={clockOutMutation.isPending}
                  icon={<LogOut className="w-4 h-4" />}
                  size="lg"
                >
                  Clock Out
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Day Complete</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      {todayStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Present Today" value={todayStats.present} icon={<CheckCircle className="w-5 h-5" />}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatCard title="Late Today" value={todayStats.late} icon={<AlertCircle className="w-5 h-5" />}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
          <StatCard title="Absent Today" value={todayStats.absent} icon={<XCircle className="w-5 h-5" />}
            gradient="bg-gradient-to-br from-red-500 to-red-600" />
        </div>
      )}

      {/* Attendance History */}
      <Card>
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="font-semibold text-slate-100">My Attendance History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : (
          <Table headers={['Date', 'Clock In', 'Clock Out', 'Hours Worked', 'Overtime', 'Status']}>
            {(myAttendance || []).map((record) => (
              <Tr key={record.id}>
                <Td className="font-medium text-slate-200">{formatDate(record.date)}</Td>
                <Td>{record.clockIn || '—'}</Td>
                <Td>{record.clockOut || '—'}</Td>
                <Td>{record.workHours ? `${record.workHours}h` : '—'}</Td>
                <Td>{record.overtimeHours ? <span className="text-amber-400">{record.overtimeHours}h</span> : '—'}</Td>
                <Td><Badge variant={statusVariant(record.status)}>{record.status}</Badge></Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

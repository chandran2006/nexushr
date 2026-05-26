import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, Button, Badge, Skeleton, EmptyState } from '@/components/ui'
import { timeAgo } from '@/lib/utils'
import api from '@/lib/api'
import type { Notification } from '@/types'

const typeVariant = (type: string): any => {
  const m: Record<string, any> = {
    LEAVE_REQUEST: 'yellow', LEAVE_APPROVED: 'green', LEAVE_REJECTED: 'red',
    PAYROLL_PROCESSED: 'blue', PAYSLIP_READY: 'green',
    PERFORMANCE_REVIEW: 'purple', SYSTEM: 'gray', ANNOUNCEMENT: 'cyan',
  }
  return m[type] || 'gray'
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => api.get('/notifications?page=0&size=50').then(r => r.data.data),
  })

  const readAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => { toast.success('All marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications: Notification[] = data?.content || []
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-1">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" icon={<CheckCheck className="w-4 h-4" />}
            onClick={() => readAllMutation.mutate()} loading={readAllMutation.isPending}>
            Mark all read
          </Button>
        )}
      </motion.div>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
        ) : !notifications.length ? (
          <EmptyState icon={<Bell className="w-10 h-10" />} title="No notifications"
            description="You're all caught up! Notifications will appear here." />
        ) : (
          <div className="divide-y divide-slate-700/30">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-start gap-4 p-4 hover:bg-slate-700/20 transition-colors cursor-pointer ${!n.read ? 'bg-blue-500/5' : ''}`}
                onClick={() => !n.read && readMutation.mutate(n.id)}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-blue-400' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${!n.read ? 'text-slate-100' : 'text-slate-300'}`}>{n.title}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                    <Badge variant={typeVariant(n.type)} className="flex-shrink-0 text-xs">
                      {n.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

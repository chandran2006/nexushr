import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target, Plus, TrendingUp, Star, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, Button, Badge, Table, Tr, Td, Skeleton, EmptyState, Modal, Input, Select, Progress, StatCard } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import type { Goal, GoalStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'

export default function PerformancePage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [goalModal, setGoalModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', targetDate: '', priority: 'MEDIUM', category: '', keyResults: '' })

  const { data: myEmployee } = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: () => api.get('/employees/me').then(r => r.data.data),
  })

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', myEmployee?.id],
    queryFn: () => api.get(`/performance/goals/employee/${myEmployee?.id}?page=0&size=20`).then(r => r.data.data),
    enabled: !!myEmployee?.id,
  })

  const createGoalMutation = useMutation({
    mutationFn: (data: any) => api.post('/performance/goals', { ...data, employeeId: myEmployee?.id }),
    onSuccess: () => { toast.success('Goal created!'); qc.invalidateQueries({ queryKey: ['goals'] }); setGoalModal(false) },
    onError: () => toast.error('Failed to create goal'),
  })

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress, status }: { id: string; progress: number; status: string }) =>
      api.put(`/performance/goals/${id}/progress`, { progress, status }),
    onSuccess: () => { toast.success('Progress updated'); qc.invalidateQueries({ queryKey: ['goals'] }) },
  })

  const goalList: Goal[] = goals?.content || []
  const completed = goalList.filter(g => g.status === 'COMPLETED').length
  const inProgress = goalList.filter(g => g.status === 'IN_PROGRESS').length
  const avgProgress = goalList.length > 0
    ? Math.round(goalList.reduce((sum, g) => sum + Number(g.progressPercentage), 0) / goalList.length)
    : 0

  const statusVariant = (s: GoalStatus): any => {
    const m: Record<string, any> = { NOT_STARTED: 'gray', IN_PROGRESS: 'blue', COMPLETED: 'green', CANCELLED: 'red', ON_HOLD: 'yellow' }
    return m[s] || 'gray'
  }

  const priorityVariant = (p: string): any => {
    const m: Record<string, any> = { LOW: 'gray', MEDIUM: 'blue', HIGH: 'yellow', CRITICAL: 'red' }
    return m[p] || 'gray'
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Performance</h1>
          <p className="text-slate-400 text-sm mt-1">Track goals, OKRs, and performance reviews</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setGoalModal(true)}>Add Goal</Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Goals Completed" value={completed} icon={<CheckCircle className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard title="In Progress" value={inProgress} icon={<TrendingUp className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Avg Progress" value={`${avgProgress}%`} icon={<Target className="w-5 h-5" />}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
      </div>

      <Card>
        <div className="p-5 border-b border-slate-700/50">
          <h3 className="font-semibold text-slate-100">My Goals & OKRs</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
        ) : !goalList.length ? (
          <EmptyState icon={<Target className="w-10 h-10" />} title="No goals set"
            description="Set your first goal to start tracking your performance"
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setGoalModal(true)}>Add Goal</Button>} />
        ) : (
          <div className="p-4 space-y-3">
            {goalList.map((goal) => (
              <div key={goal.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-200">{goal.title}</p>
                      <Badge variant={priorityVariant(goal.priority || 'MEDIUM')}>{goal.priority}</Badge>
                    </div>
                    {goal.description && <p className="text-sm text-slate-400 line-clamp-1">{goal.description}</p>}
                    {goal.targetDate && <p className="text-xs text-slate-500 mt-1">Due: {formatDate(goal.targetDate)}</p>}
                  </div>
                  <Badge variant={statusVariant(goal.status)}>{goal.status.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={Number(goal.progressPercentage)} color="blue" size="sm" showLabel />
                  {goal.status !== 'COMPLETED' && (
                    <button
                      onClick={() => updateProgressMutation.mutate({ id: goal.id, progress: 100, status: 'COMPLETED' })}
                      className="text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="Create New Goal">
        <form onSubmit={e => { e.preventDefault(); createGoalMutation.mutate(form) }} className="space-y-4">
          <Input label="Goal Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Complete AWS certification" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe your goal..." rows={2}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Date" type="date" value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
            <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'CRITICAL', label: 'Critical' }]} />
          </div>
          <Input label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Technical, Leadership, Communication" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Key Results</label>
            <textarea value={form.keyResults} onChange={e => setForm(f => ({ ...f, keyResults: e.target.value }))}
              placeholder="Define measurable key results..." rows={2}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setGoalModal(false)}>Cancel</Button>
            <Button type="submit" loading={createGoalMutation.isPending}>Create Goal</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Plus, Users, MapPin, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Card, Button, Badge, Table, Tr, Td, Skeleton, EmptyState, StatCard } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import type { JobPosting, Candidate } from '@/types'

export default function RecruitmentPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs')

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/recruitment/jobs?page=0&size=20').then(r => r.data.data),
  })

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.get('/recruitment/candidates?page=0&size=20').then(r => r.data.data),
    enabled: activeTab === 'candidates',
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.put(`/recruitment/jobs/${id}/publish`),
    onSuccess: () => { toast.success('Job published!'); qc.invalidateQueries({ queryKey: ['jobs'] }) },
  })

  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/recruitment/candidates/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['candidates'] }) },
  })

  const jobList: JobPosting[] = jobs?.content || []
  const candidateList: Candidate[] = candidates?.content || []

  const jobStatusVariant = (s: string): any => {
    const m: Record<string, any> = { DRAFT: 'gray', PUBLISHED: 'green', CLOSED: 'red', ON_HOLD: 'yellow' }
    return m[s] || 'gray'
  }

  const candidateStatusVariant = (s: string): any => {
    const m: Record<string, any> = {
      APPLIED: 'blue', SCREENING: 'yellow', INTERVIEW_SCHEDULED: 'purple',
      INTERVIEWED: 'cyan', OFFER_SENT: 'green', HIRED: 'green', REJECTED: 'red', WITHDRAWN: 'gray',
    }
    return m[s] || 'gray'
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Recruitment</h1>
          <p className="text-slate-400 text-sm mt-1">Manage job postings and candidate pipeline</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Post Job</Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Open Positions" value={jobList.filter(j => j.status === 'PUBLISHED').length}
          icon={<Briefcase className="w-5 h-5" />} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Total Candidates" value={candidates?.totalElements || 0}
          icon={<Users className="w-5 h-5" />} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
        <StatCard title="Interviews Scheduled" value={candidateList.filter(c => c.status === 'INTERVIEW_SCHEDULED').length}
          icon={<Calendar className="w-5 h-5" />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id: 'jobs', label: 'Job Postings' }, { id: 'candidates', label: 'Candidates' }].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'jobs' && (
        <Card>
          {jobsLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : !jobList.length ? (
            <EmptyState icon={<Briefcase className="w-10 h-10" />} title="No job postings"
              description="Create your first job posting to start recruiting"
              action={<Button icon={<Plus className="w-4 h-4" />}>Post Job</Button>} />
          ) : (
            <div className="p-4 space-y-3">
              {jobList.map((job) => (
                <div key={job.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-200">{job.title}</h4>
                        <Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" /> {job.department.name}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                        )}
                        {job.salaryMin && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatCurrency(job.salaryMin)} – {job.salaryMax ? formatCurrency(job.salaryMax) : 'Open'}
                          </span>
                        )}
                        <span>{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {job.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => publishMutation.mutate(job.id)}>Publish</Button>
                      )}
                      <Button size="sm" variant="secondary">View</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'candidates' && (
        <Card>
          {candidatesLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : !candidateList.length ? (
            <EmptyState icon={<Users className="w-10 h-10" />} title="No candidates yet" description="Candidates will appear here once they apply" />
          ) : (
            <Table headers={['Candidate', 'Position', 'Experience', 'Status', 'Applied', 'Actions']}>
              {candidateList.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <div>
                      <p className="font-medium text-slate-200">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-slate-300">{c.jobPosting?.title}</p>
                    {c.currentTitle && <p className="text-xs text-slate-500">{c.currentTitle} @ {c.currentCompany}</p>}
                  </Td>
                  <Td>{c.yearsOfExperience ? `${c.yearsOfExperience} yrs` : '—'}</Td>
                  <Td><Badge variant={candidateStatusVariant(c.status)}>{c.status.replace('_', ' ')}</Badge></Td>
                  <Td className="text-slate-400">{formatDate(c.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      {c.status === 'APPLIED' && (
                        <Button size="sm" variant="secondary"
                          onClick={() => updateCandidateMutation.mutate({ id: c.id, status: 'SCREENING' })}>
                          Screen
                        </Button>
                      )}
                      {c.status === 'SCREENING' && (
                        <Button size="sm"
                          onClick={() => updateCandidateMutation.mutate({ id: c.id, status: 'INTERVIEW_SCHEDULED' })}>
                          Schedule
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      )}
    </div>
  )
}

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Card, Button, Badge, Avatar, Table, Tr, Td, Skeleton, EmptyState, Modal, Input, Select } from '@/components/ui'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import type { Employee, PageResponse } from '@/types'

export default function EmployeesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [viewModal, setViewModal] = useState(false)

  const { data, isLoading } = useQuery<PageResponse<Employee>>({
    queryKey: ['employees', page, debouncedSearch],
    queryFn: () => api.get(`/employees?page=${page}&size=15&search=${debouncedSearch}`).then(r => r.data.data),
  })

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments').then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => { toast.success('Employee deleted'); qc.invalidateQueries({ queryKey: ['employees'] }) },
    onError: () => toast.error('Failed to delete employee'),
  })

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(0) }, 400)
  }, [])

  const statusVariant = (s: string): any => {
    const m: Record<string, any> = { ACTIVE: 'green', ON_LEAVE: 'yellow', TERMINATED: 'red', SUSPENDED: 'red', PROBATION: 'blue' }
    return m[s] || 'gray'
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">{data?.totalElements || 0} total employees</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>Export</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add Employee</Button>
        </div>
      </motion.div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>Filter</Button>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : !data?.content?.length ? (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="No employees found"
            description="Add your first employee or adjust your search filters"
            action={<Button icon={<Plus className="w-4 h-4" />}>Add Employee</Button>}
          />
        ) : (
          <>
            <Table headers={['Employee', 'Department', 'Job Title', 'Status', 'Hire Date', 'Salary', 'Actions']}>
              {data.content.map((emp) => (
                <Tr key={emp.id} onClick={() => { setSelectedEmployee(emp); setViewModal(true) }}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.fullName} src={emp.profileImageUrl} size="sm" />
                      <div>
                        <p className="font-medium text-slate-200">{emp.fullName}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div>
                      <p className="text-slate-300">{emp.department?.name || '—'}</p>
                      <p className="text-xs text-slate-500">{emp.employeeId}</p>
                    </div>
                  </Td>
                  <Td>
                    <div>
                      <p className="text-slate-300">{emp.jobTitle}</p>
                      <p className="text-xs text-slate-500">{emp.jobLevel || emp.employmentType}</p>
                    </div>
                  </Td>
                  <Td><Badge variant={statusVariant(emp.status)}>{emp.status}</Badge></Td>
                  <Td className="text-slate-400">{formatDate(emp.hireDate)}</Td>
                  <Td className="font-medium text-slate-300">
                    {emp.baseSalary ? formatCurrency(emp.baseSalary, emp.currency) : '—'}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setSelectedEmployee(emp); setViewModal(true) }}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                Showing {page * 15 + 1}–{Math.min((page + 1) * 15, data.totalElements)} of {data.totalElements}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={data.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="text-sm text-slate-400">{page + 1} / {data.totalPages}</span>
                <Button variant="secondary" size="sm" disabled={data.last} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* View Employee Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Employee Details" size="lg">
        {selectedEmployee && <EmployeeDetail employee={selectedEmployee} />}
      </Modal>
    </div>
  )
}

function EmployeeDetail({ employee: emp }: { employee: Employee }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Avatar name={emp.fullName} src={emp.profileImageUrl} size="xl" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-100">{emp.fullName}</h3>
          <p className="text-slate-400">{emp.jobTitle} · {emp.department?.name}</p>
          <p className="text-sm text-slate-500 mt-1">{emp.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={emp.status === 'ACTIVE' ? 'green' : 'gray'}>{emp.status}</Badge>
            <Badge variant="blue">{emp.employeeId}</Badge>
            {emp.employmentType && <Badge variant="purple">{emp.employmentType}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Hire Date', value: formatDate(emp.hireDate) },
          { label: 'Department', value: emp.department?.name || '—' },
          { label: 'Manager', value: emp.manager?.fullName || '—' },
          { label: 'Base Salary', value: emp.baseSalary ? formatCurrency(emp.baseSalary, emp.currency) : '—' },
          { label: 'Annual Leave', value: `${emp.annualLeaveBalance} days` },
          { label: 'Sick Leave', value: `${emp.sickLeaveBalance} days` },
          { label: 'Nationality', value: emp.nationality || '—' },
          { label: 'Phone', value: emp.phoneNumber || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-200">{value}</p>
          </div>
        ))}
      </div>

      {emp.skills && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {emp.skills.split(',').map(s => (
              <Badge key={s} variant="blue">{s.trim()}</Badge>
            ))}
          </div>
        </div>
      )}

      {emp.attritionRiskScore !== undefined && (
        <div className="p-4 bg-slate-900/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-300">Attrition Risk Score</p>
            <Badge variant={Number(emp.attritionRiskScore) >= 70 ? 'red' : Number(emp.attritionRiskScore) >= 40 ? 'yellow' : 'green'}>
              {Number(emp.attritionRiskScore) >= 70 ? 'HIGH' : Number(emp.attritionRiskScore) >= 40 ? 'MEDIUM' : 'LOW'}
            </Badge>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${Number(emp.attritionRiskScore) >= 70 ? 'bg-red-500' : Number(emp.attritionRiskScore) >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${emp.attritionRiskScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{emp.attritionRiskScore}% risk score</p>
        </div>
      )}
    </div>
  )
}

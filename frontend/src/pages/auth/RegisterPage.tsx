import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Zap, ArrowRight } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { Button, Input, Select } from '@/components/ui'
import api from '@/lib/api'
import type { ApiResponse, AuthResponse } from '@/types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phoneNumber: '', role: 'EMPLOYEE',
  })

  const { mutate: register, isPending } = useMutation({
    mutationFn: (data: typeof form) =>
      api.post<ApiResponse<AuthResponse>>('/auth/register', data).then(r => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Registration failed')
    },
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">NexusHR</span>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
          <p className="text-slate-400">Join NexusHR to manage your workforce intelligently</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); register(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" value={form.firstName} onChange={set('firstName')}
              placeholder="John" icon={<User className="w-4 h-4" />} required />
            <Input label="Last name" value={form.lastName} onChange={set('lastName')}
              placeholder="Doe" required />
          </div>
          <Input label="Email address" type="email" value={form.email} onChange={set('email')}
            placeholder="you@company.com" icon={<Mail className="w-4 h-4" />} required />
          <Input label="Phone number" type="tel" value={form.phoneNumber} onChange={set('phoneNumber')}
            placeholder="+1 (555) 000-0000" icon={<Phone className="w-4 h-4" />} />
          <Select
            label="Role"
            value={form.role}
            onChange={set('role')}
            options={[
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'HR_MANAGER', label: 'HR Manager' },
              { value: 'HR_ADMIN', label: 'HR Admin' },
              { value: 'FINANCE', label: 'Finance' },
              { value: 'EXECUTIVE', label: 'Executive' },
            ]}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Min 8 chars, uppercase, number"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm pl-10 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={isPending} className="w-full py-3 mt-2" size="lg">
            Create account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

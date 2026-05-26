import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'
import api from '@/lib/api'
import type { ApiResponse, AuthResponse } from '@/types'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const { mutate: login, isPending } = useMutation({
    mutationFn: (data: typeof form) =>
      api.post<ApiResponse<AuthResponse>>('/auth/login', data).then(r => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome back, ${data.user.firstName}!`)
      navigate('/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    },
  })

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-slate-950" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NexusHR</h1>
                <p className="text-sm text-slate-400">Amdox Technologies</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              AI-Powered HR<br />
              <span className="text-gradient">Intelligence Platform</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Streamline your workforce management with intelligent automation, real-time analytics, and AI-driven insights.
            </p>
            <div className="space-y-4">
              {[
                { icon: '🤖', title: 'AI Attrition Prediction', desc: 'Identify at-risk employees before they leave' },
                { icon: '📊', title: 'Real-time Analytics', desc: 'Live dashboards with actionable insights' },
                { icon: '⚡', title: 'Automated Workflows', desc: 'Streamline HR processes end-to-end' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-semibold text-slate-200">{title}</p>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">NexusHR</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); login(form) }} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@company.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm pl-10 pr-10 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500" />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={isPending} className="w-full py-3" size="lg">
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create account
            </Link>
          </p>

          <div className="mt-8 p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
            <p className="text-xs text-slate-500 mb-2 font-medium">Demo credentials:</p>
            <p className="text-xs text-slate-400">Email: <span className="text-slate-300">admin@nexushr.com</span></p>
            <p className="text-xs text-slate-400">Password: <span className="text-slate-300">Admin@123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Brain, Send, Bot, User, Sparkles, TrendingDown, Target, Zap, RefreshCw } from 'lucide-react'
import { Card, Button, Badge, Input, Avatar, Skeleton } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  'How do I apply for annual leave?',
  'What is the company leave policy?',
  'How is my performance review calculated?',
  'When is the next payroll processing date?',
  'How do I update my emergency contact?',
  'What are the work from home guidelines?',
]

export default function AIPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello ${user?.firstName}! 👋 I'm your NexusHR AI Assistant. I can help you with HR policies, leave management, payroll queries, performance reviews, and much more. How can I assist you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState<'chat' | 'attrition' | 'skills'>('chat')
  const [employeeId, setEmployeeId] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      api.post('/ai/chat', { message }).then(r => r.data.data.response),
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }])
    },
  })

  const attritionMutation = useMutation({
    mutationFn: (id: string) => api.get(`/ai/attrition/${id}`).then(r => r.data.data),
  })

  const skillGapMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.get(`/ai/skill-gap/${id}?targetRole=${encodeURIComponent(role)}`).then(r => r.data.data),
  })

  const sendMessage = (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }])
    chatMutation.mutate(msg)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-400" />
            AI Workforce Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1">Powered by OpenAI · HR insights at your fingertips</p>
        </div>
        <Badge variant="purple">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Enabled
        </Badge>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'chat', label: 'HR Assistant', icon: Bot },
          { id: 'attrition', label: 'Attrition Prediction', icon: TrendingDown },
          { id: 'skills', label: 'Skill Gap Analysis', icon: Target },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card className="flex flex-col" style={{ height: '600px' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <Avatar name={user?.fullName || 'User'} src={user?.profileImageUrl} size="sm" />
                      )}
                      <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white rounded-tr-sm'
                            : 'bg-slate-700/60 text-slate-200 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-slate-600">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-700/50">
                <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything about HR policies, leave, payroll..."
                    className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                  <Button type="submit" disabled={!input.trim() || chatMutation.isPending}
                    icon={<Send className="w-4 h-4" />} className="px-4">
                    Send
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Quick Questions
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 px-3 py-2.5 rounded-lg transition-all border border-transparent hover:border-slate-600/50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-violet-500/10 to-blue-500/10 border-violet-500/20">
              <h3 className="font-semibold text-slate-100 mb-2">AI Capabilities</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {['HR Policy Guidance', 'Leave Management Help', 'Payroll Queries', 'Performance Advice', 'Career Development', 'Compliance Support'].map(cap => (
                  <li key={cap} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {cap}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Attrition Prediction Tab */}
      {activeTab === 'attrition' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-100 mb-4">Attrition Risk Prediction</h3>
            <p className="text-sm text-slate-400 mb-5">Enter an employee ID to predict their attrition risk using AI analysis.</p>
            <div className="space-y-4">
              <Input label="Employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                placeholder="Enter employee UUID..." />
              <Button onClick={() => attritionMutation.mutate(employeeId)} loading={attritionMutation.isPending}
                disabled={!employeeId} icon={<Brain className="w-4 h-4" />} className="w-full">
                Analyze Attrition Risk
              </Button>
            </div>

            {attritionMutation.data && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-400">Risk Score</p>
                    <p className="text-3xl font-bold text-slate-100">{attritionMutation.data.riskScore?.toFixed(1)}%</p>
                  </div>
                  <Badge variant={attritionMutation.data.riskLevel === 'HIGH' ? 'red' : attritionMutation.data.riskLevel === 'MEDIUM' ? 'yellow' : 'green'}>
                    {attritionMutation.data.riskLevel} RISK
                  </Badge>
                </div>

                {attritionMutation.data.riskFactors?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Risk Factors</p>
                    <ul className="space-y-1.5">
                      {attritionMutation.data.riskFactors.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-red-400 mt-0.5">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {attritionMutation.data.recommendations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Recommendations</p>
                    <ul className="space-y-1.5">
                      {attritionMutation.data.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-emerald-400 mt-0.5">✓</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-100 mb-4">Skill Gap Analysis</h3>
            <p className="text-sm text-slate-400 mb-5">Analyze skill gaps for career progression to a target role.</p>
            <div className="space-y-4">
              <Input label="Employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                placeholder="Enter employee UUID..." />
              <Input label="Target Role" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Engineer, Tech Lead..." />
              <Button onClick={() => skillGapMutation.mutate({ id: employeeId, role: targetRole })}
                loading={skillGapMutation.isPending} disabled={!employeeId || !targetRole}
                icon={<Target className="w-4 h-4" />} className="w-full">
                Analyze Skill Gap
              </Button>
            </div>

            {skillGapMutation.data && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-400">Readiness Score</p>
                    <p className="text-3xl font-bold text-slate-100">{skillGapMutation.data.readinessScore}%</p>
                  </div>
                  <Badge variant={skillGapMutation.data.readinessScore >= 70 ? 'green' : skillGapMutation.data.readinessScore >= 40 ? 'yellow' : 'red'}>
                    {skillGapMutation.data.targetRole}
                  </Badge>
                </div>

                {skillGapMutation.data.skillGaps?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Skill Gaps ({skillGapMutation.data.skillGaps.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGapMutation.data.skillGaps.map((s: string) => (
                        <Badge key={s} variant="red">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {skillGapMutation.data.matchedSkills?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Matched Skills ({skillGapMutation.data.matchedSkills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGapMutation.data.matchedSkills.map((s: string) => (
                        <Badge key={s} variant="green">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {skillGapMutation.data.trainingRecommendations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Training Recommendations</p>
                    <ul className="space-y-1.5">
                      {skillGapMutation.data.trainingRecommendations.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

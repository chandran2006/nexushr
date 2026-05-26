import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import EmployeesPage from '@/pages/employees/EmployeesPage'
import AttendancePage from '@/pages/attendance/AttendancePage'
import LeavePage from '@/pages/attendance/LeavePage'
import PayrollPage from '@/pages/payroll/PayrollPage'
import PerformancePage from '@/pages/performance/PerformancePage'
import RecruitmentPage from '@/pages/recruitment/RecruitmentPage'
import AIPage from '@/pages/ai/AIPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavePage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="recruitment" element={<RecruitmentPage />} />
            <Route path="ai" element={<AIPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="departments" element={<DashboardPage />} />
            <Route path="audit" element={<DashboardPage />} />
            <Route path="profile" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' },
        }}
        richColors
      />
    </QueryClientProvider>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, DollarSign, TrendingUp, Brain,
  Briefcase, Bell, Settings, Shield, Building2, FileText,
  BarChart2, Target, Calendar, Download, Award, UserCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import RoleLayout from '@/layouts/RoleLayout'
import type { NavItem } from '@/layouts/RoleSidebar'
import type { UserRole } from '@/types'

import EmployeesPage from '@/pages/employees/EmployeesPage'
import AttendancePage from '@/pages/attendance/AttendancePage'
import LeavePage from '@/pages/attendance/LeavePage'
import PayrollPage from '@/pages/payroll/PayrollPage'
import PerformancePage from '@/pages/performance/PerformancePage'
import RecruitmentPage from '@/pages/recruitment/RecruitmentPage'
import AIPage from '@/pages/ai/AIPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

import SuperAdminDashboard from '@/dashboards/SuperAdminDashboard'
import HRAdminDashboard from '@/dashboards/HRAdminDashboard'
import HRManagerDashboard from '@/dashboards/HRManagerDashboard'
import ManagerDashboard from '@/dashboards/ManagerDashboard'
import EmployeeDashboard from '@/dashboards/EmployeeDashboard'
import FinanceDashboard from '@/dashboards/FinanceDashboard'
import ExecutiveDashboard from '@/dashboards/ExecutiveDashboard'
import RecruiterDashboard from '@/dashboards/RecruiterDashboard'

const SUPER_ADMIN_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Users' },
  { to: '/departments', icon: Building2, label: 'Roles & Depts' },
  { to: '/audit', icon: Shield, label: 'Audit Logs' },
  { to: '/ai', icon: Brain, label: 'Analytics' },
  { to: '/notifications', icon: Bell, label: 'Security' },
  { to: '/settings', icon: Settings, label: 'System Settings' },
]

const HR_ADMIN_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/leaves', icon: FileText, label: 'Leaves' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/recruitment', icon: Briefcase, label: 'Recruitment' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/ai', icon: Brain, label: 'AI Insights' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const HR_MANAGER_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Team Employees' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/leaves', icon: FileText, label: 'Leave Requests' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Reports' },
]

const MANAGER_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Team' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/performance', icon: Target, label: 'Goals' },
  { to: '/leaves', icon: FileText, label: 'Leave Requests' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

const EMPLOYEE_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/settings', icon: UserCheck, label: 'My Profile' },
  { to: '/attendance', icon: Clock, label: 'Attendance' },
  { to: '/leaves', icon: Calendar, label: 'My Leaves' },
  { to: '/payroll', icon: DollarSign, label: 'Payslips' },
  { to: '/performance', icon: Target, label: 'My Goals' },
  { to: '/ai', icon: Brain, label: 'AI Assistant' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
]

const FINANCE_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/leaves', icon: FileText, label: 'Tax Reports' },
  { to: '/ai', icon: BarChart2, label: 'Salary Analytics' },
  { to: '/notifications', icon: Download, label: 'Exports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const EXECUTIVE_NAV: NavItem[] = [
  { to: '/dashboard', icon: Award, label: 'Executive Overview' },
  { to: '/employees', icon: Users, label: 'Workforce Analytics' },
  { to: '/ai', icon: Brain, label: 'AI Insights' },
  { to: '/performance', icon: TrendingUp, label: 'Forecasting' },
  { to: '/notifications', icon: Bell, label: 'Reports' },
]

const RECRUITER_NAV: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruitment', icon: Users, label: 'Candidates' },
  { to: '/attendance', icon: Calendar, label: 'Interviews' },
  { to: '/employees', icon: Briefcase, label: 'Jobs' },
  { to: '/ai', icon: BarChart2, label: 'Analytics' },
  { to: '/notifications', icon: Bell, label: 'Onboarding' },
]

interface RoleConfig {
  nav: NavItem[]
  dashboard: React.ComponentType
  accentColor: string
  logoGradient: string
  sectionLabel: string
}

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    nav: SUPER_ADMIN_NAV,
    dashboard: SuperAdminDashboard,
    accentColor: 'red',
    logoGradient: 'from-red-500 to-rose-600',
    sectionLabel: 'Super Admin',
  },
  HR_ADMIN: {
    nav: HR_ADMIN_NAV,
    dashboard: HRAdminDashboard,
    accentColor: 'blue',
    logoGradient: 'from-blue-500 to-blue-600',
    sectionLabel: 'HR Operations',
  },
  HR_MANAGER: {
    nav: HR_MANAGER_NAV,
    dashboard: HRManagerDashboard,
    accentColor: 'violet',
    logoGradient: 'from-violet-500 to-purple-600',
    sectionLabel: 'HR Manager',
  },
  MANAGER: {
    nav: MANAGER_NAV,
    dashboard: ManagerDashboard,
    accentColor: 'cyan',
    logoGradient: 'from-cyan-500 to-blue-600',
    sectionLabel: 'Team Manager',
  },
  EMPLOYEE: {
    nav: EMPLOYEE_NAV,
    dashboard: EmployeeDashboard,
    accentColor: 'emerald',
    logoGradient: 'from-emerald-500 to-teal-600',
    sectionLabel: 'Employee Portal',
  },
  FINANCE: {
    nav: FINANCE_NAV,
    dashboard: FinanceDashboard,
    accentColor: 'amber',
    logoGradient: 'from-amber-500 to-yellow-600',
    sectionLabel: 'Finance',
  },
  EXECUTIVE: {
    nav: EXECUTIVE_NAV,
    dashboard: ExecutiveDashboard,
    accentColor: 'cyan',
    logoGradient: 'from-cyan-400 to-blue-500',
    sectionLabel: 'Executive Suite',
  },
  RECRUITER: {
    nav: RECRUITER_NAV,
    dashboard: RecruiterDashboard,
    accentColor: 'indigo',
    logoGradient: 'from-indigo-500 to-blue-600',
    sectionLabel: 'Talent Acquisition',
  },
}

export default function RoleRouter() {
  const { user } = useAuthStore()
  const role = (user?.role ?? 'EMPLOYEE') as UserRole
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.EMPLOYEE
  const Dashboard = config.dashboard

  return (
    <Routes>
      <Route
        element={
          <RoleLayout
            navItems={config.nav}
            accentColor={config.accentColor}
            logoGradient={config.logoGradient}
            sectionLabel={config.sectionLabel}
          />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="departments" element={<EmployeesPage />} />
        <Route path="audit" element={<SettingsPage />} />
        <Route path="profile" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

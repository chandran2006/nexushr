export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  profileImageUrl?: string
  role: UserRole
  status: UserStatus
  employeeId?: string
  lastLoginAt?: string
}

export type UserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'EMPLOYEE' | 'FINANCE' | 'EXECUTIVE' | 'RECRUITER'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber?: string
  profileImageUrl?: string
  jobTitle: string
  jobLevel?: string
  department?: { id: string; name: string; code: string }
  manager?: { id: string; employeeId: string; fullName: string; jobTitle: string; profileImageUrl?: string }
  hireDate: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  address?: string
  baseSalary?: number
  currency: string
  employmentType?: string
  status: EmployeeStatus
  skills?: string
  bio?: string
  linkedinUrl?: string
  annualLeaveBalance: number
  sickLeaveBalance: number
  attritionRiskScore?: number
  engagementScore?: number
  createdAt: string
}

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED' | 'PROBATION'

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  location?: string
  status: string
}

export interface Attendance {
  id: string
  employee: { id: string; employeeId: string; fullName: string }
  date: string
  clockIn?: string
  clockOut?: string
  workHours?: number
  overtimeHours?: number
  status: AttendanceStatus
  notes?: string
  location?: string
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND'

export interface LeaveRequest {
  id: string
  employee: { id: string; employeeId: string; fullName: string; profileImageUrl?: string }
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: LeaveStatus
  approvedBy?: { firstName: string; lastName: string }
  approvalNotes?: string
  approvedAt?: string
  createdAt: string
}

export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'EMERGENCY' | 'STUDY' | 'BEREAVEMENT'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface Payroll {
  id: string
  employee: { id: string; employeeId: string; fullName: string }
  payPeriodStart: string
  payPeriodEnd: string
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  medicalAllowance: number
  performanceBonus: number
  overtimePay: number
  grossSalary: number
  taxDeduction: number
  insuranceDeduction: number
  otherDeductions: number
  netSalary: number
  currency: string
  status: PayrollStatus
  paymentDate?: string
  createdAt: string
}

export type PayrollStatus = 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'PAID' | 'CANCELLED'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface DashboardData {
  employeeStats: {
    totalEmployees: number
    activeEmployees: number
    newHiresThisMonth: number
    terminationsThisMonth: number
    attritionRate: number
    avgTenureYears: number
  }
  attendanceStats: {
    presentToday: number
    absentToday: number
    lateToday: number
    onLeaveToday: number
    attendanceRate: number
  }
  payrollStats: {
    totalPayrollThisMonth: number | string
    totalPayrollLastMonth: number | string
    payrollGrowth: number
    pendingPayrolls: number
  }
  leaveStats: {
    pendingRequests: number
    approvedThisMonth: number
    rejectedThisMonth: number
  }
  recruitmentStats: {
    openPositions: number
    totalCandidates: number
    interviewsScheduled: number
    hiredThisMonth: number
  }
  departmentDistribution: Array<{ name: string; value: number }>
  headcountTrend: Array<{ month: string; count: number }>
  recentHires: Employee[]
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface Goal {
  id: string
  employee: { id: string; fullName: string }
  title: string
  description?: string
  targetDate?: string
  progressPercentage: number
  status: GoalStatus
  priority?: GoalPriority
  category?: string
  keyResults?: string
  createdAt: string
}

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface JobPosting {
  id: string
  title: string
  department?: { id: string; name: string }
  description?: string
  requirements?: string
  location?: string
  employmentType?: string
  salaryMin?: number
  salaryMax?: number
  closingDate?: string
  status: string
  openings: number
  createdAt: string
}

export interface Candidate {
  id: string
  jobPosting: { id: string; title: string }
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  linkedinUrl?: string
  yearsOfExperience?: number
  currentCompany?: string
  currentTitle?: string
  status: string
  interviewDate?: string
  notes?: string
  rating?: number
  createdAt: string
}

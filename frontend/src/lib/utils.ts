import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getRiskColor(level: string) {
  switch (level) {
    case 'HIGH': return 'badge-red'
    case 'MEDIUM': return 'badge-yellow'
    case 'LOW': return 'badge-green'
    default: return 'badge-gray'
  }
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'badge-green', INACTIVE: 'badge-gray', SUSPENDED: 'badge-red',
    PENDING: 'badge-yellow', APPROVED: 'badge-green', REJECTED: 'badge-red',
    PAID: 'badge-green', DRAFT: 'badge-gray', PROCESSING: 'badge-blue',
    PRESENT: 'badge-green', ABSENT: 'badge-red', LATE: 'badge-yellow',
    PUBLISHED: 'badge-blue', CLOSED: 'badge-gray',
  }
  return map[status] || 'badge-gray'
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

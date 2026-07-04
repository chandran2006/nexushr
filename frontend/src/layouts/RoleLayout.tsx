import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import RoleSidebar, { type NavItem } from './RoleSidebar'
import { useUIStore } from '@/store/uiStore'

interface RoleLayoutProps {
  navItems: NavItem[]
  accentColor?: string
  logoGradient?: string
  sectionLabel?: string
}

export default function RoleLayout({ navItems, accentColor, logoGradient, sectionLabel }: RoleLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-slate-950">
      <RoleSidebar items={navItems} accentColor={accentColor} logoGradient={logoGradient} sectionLabel={sectionLabel} />
      <Navbar />
      <motion.main
        animate={{ paddingLeft: sidebarCollapsed ? '72px' : '256px' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  )
}

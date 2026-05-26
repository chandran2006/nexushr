import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useUIStore } from '@/store/uiStore'

export default function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
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

import { Metadata } from 'next'
import WaterTankDashboard from '@/components/dashboard/water-tank-dashboard'

export const metadata: Metadata = {
  title: 'Water Tank MES Dashboard',
  description: 'Monitor and control your water tank system',
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Water Tank MES Dashboard</h1>
      </div>
      
      <WaterTankDashboard initialData={null} />
    </div>
  )
} 
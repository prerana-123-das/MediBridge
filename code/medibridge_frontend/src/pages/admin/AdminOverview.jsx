import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, UserCheck, Calendar, CalendarDays, FileText, TrendingUp, UserPlus, UserX } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import { adminNav } from './adminNav'
import { fetchAdminDashboard, fetchAdminContactMessages, fetchMarkContactMessageRead } from '../../features/admin/adminSlice'

const activityIcon = { patient: { i: Users, c: 'bg-blue-100 text-primary-600' }, consult: { i: FileText, c: 'bg-green-100 text-green-600' }, doctor: { i: UserPlus, c: 'bg-purple-100 text-purple-600' }, cancel: { i: UserX, c: 'bg-red-100 text-red-500' } }

// The main landing page for the Admin portal, displaying high-level statistics
// and a feed of recent "Contact Us" form submissions.
export default function AdminOverview() {
  const dispatch = useDispatch()
  
  // Pull the admin data from the Redux store
  const { stats, activity, contactMessages } = useSelector((s) => s.admin)
  
  // Fetch the latest dashboard numbers and contact messages as soon as the page loads
  useEffect(() => { 
    dispatch(fetchAdminDashboard()) 
    dispatch(fetchAdminContactMessages())
  }, [dispatch])
  
  // Show a simple loading state if the backend hasn't responded with the stats yet
  if (!stats) return <DashboardLayout badge="Admin" navItems={adminNav}><div className="p-10 text-slate-400">Loading...</div></DashboardLayout>

  // Configuration for the 3 large gradient stat cards at the top
  const bigStats = [
    { icon: Users, value: (stats.totalPatients || 0).toLocaleString(), label: 'Total Patients', grad: 'from-blue-500 to-blue-600' },
    { icon: UserCheck, value: stats.activeDoctors || 0, label: 'Active Doctors', grad: 'from-green-500 to-green-600' },
    { icon: Calendar, value: (stats.totalAppointments || 0).toLocaleString(), label: 'Total Appointments', grad: 'from-purple-500 to-purple-600' },
  ]
  
  // Configuration for the 3 smaller white stat cards below the big ones
  const small = [
    { label: 'Appointments Today', value: stats.appointmentsToday || stats.activeToday || 0, icon: CalendarDays, c: 'bg-amber-100 text-amber-500' },
    { label: 'Completed Today', value: stats.completedToday || 0, icon: FileText, c: 'bg-green-100 text-green-600' },
    { label: 'Total Revenue', value: `$${(stats.estimatedRevenue || stats.revenueMTD || 0).toLocaleString()}`, icon: TrendingUp, c: 'bg-blue-100 text-primary-600' },
  ]

  return (
    <DashboardLayout badge="Admin" navItems={adminNav}>
      
      {/* SECTION 1: The large gradient stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {bigStats.map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.grad} p-6 text-white shadow-sm`}>
            <s.icon size={26} className="opacity-90" />
            <div className="mt-6 text-4xl font-extrabold">{s.value}</div>
            <div className="mt-1 text-sm text-white/90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* SECTION 2: The smaller white stat cards */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {small.map((s) => (
          <Card key={s.label} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">{s.label}</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{s.value}</div>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.c}`}><s.icon size={20} /></div>
          </Card>
        ))}
      </div>

      {/* SECTION 3: The Contact Us Form Table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-primary-600" />
          Contact Us Forms
        </h3>
        <Card className="overflow-hidden">
          {contactMessages && contactMessages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Subject & Message</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contactMessages.map((msg) => (
                    <tr key={msg.id} className={`transition-colors hover:bg-slate-50 ${!msg.read ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(msg.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{msg.name}</div>
                        <div className="text-slate-500 text-xs">{msg.email}</div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-semibold text-slate-900 truncate">{msg.subject}</div>
                        <div className="text-slate-600 text-xs mt-1 truncate" title={msg.message}>{msg.message}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* 
                          If the message hasn't been read, show a clickable button to mark it as read.
                          If it has been read, just show a grey 'Read' badge.
                        */}
                        {!msg.read ? (
                          <button
                            onClick={() => dispatch(fetchMarkContactMessageRead(msg.id))}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            Mark Read
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 px-3 py-1.5 bg-slate-100 rounded-full">
                            Read
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No contact messages found.
            </div>
          )}
        </Card>
      </div>

    </DashboardLayout>
  )
}

import { Activity } from 'lucide-react'

export default function Logo({ badge, size = 'md' }) {
  const isLg = size === 'lg'
  return (
    <div className="d-flex align-items-center gap-2">
      <Activity strokeWidth={2.5} size={isLg ? 30 : 26} style={{ color: '#2563EB' }} />
      <span className="fw-bolder" style={{ color: '#0f172a', fontSize: isLg ? '1.5rem' : '1.25rem' }}>
        MediBridge
      </span>
      {badge && (
        <span
          className="ms-1 rounded-pill px-2 py-1 fw-semibold"
          style={{
            fontSize: '0.75rem',
            backgroundColor: badge === 'Admin' ? '#fee2e2' : '#dbeafe',
            color: badge === 'Admin' ? '#dc2626' : '#2563EB'
          }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

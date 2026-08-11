import { User } from 'lucide-react'

export default function Avatar({ color = 'blue', size = 40, icon: Icon = User }) {
  const colors = {
    blue: { bg: '#dbeafe', text: '#2563eb' },
    gray: { bg: '#f1f5f9', text: '#94a3b8' },
    yellow: { bg: '#fef9c3', text: '#ca8a04' },
    green: { bg: '#dcfce7', text: '#16a34a' },
    solid: { bg: '#2563EB', text: '#ffffff' },
    red: { bg: '#ef4444', text: '#ffffff' },
  }
  const theme = colors[color] || colors.blue

  return (
    <div
      className="d-flex flex-shrink-0 align-items-center justify-content-center rounded-circle"
      style={{ width: size, height: size, backgroundColor: theme.bg, color: theme.text }}
    >
      <Icon size={size * 0.5} />
    </div>
  )
}

import { StatusBadge } from '../status-badge'

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="online" />
      <StatusBadge status="offline" />
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
      <StatusBadge status="pending" />
    </div>
  )
}
import { Badge } from "@/components/ui/badge"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig = {
  online: {
    label: "Online",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    iconClassName: "text-green-600 dark:text-green-400"
  },
  offline: {
    label: "Offline", 
    className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400",
    iconClassName: "text-red-600 dark:text-red-400"
  },
  active: {
    label: "Hoạt động",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400", 
    iconClassName: "text-green-600 dark:text-green-400"
  },
  inactive: {
    label: "Không hoạt động",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400",
    iconClassName: "text-gray-600 dark:text-gray-400"
  },
  pending: {
    label: "Chờ xử lý",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400",
    iconClassName: "text-yellow-600 dark:text-yellow-400"
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline

  return (
    <Badge 
      variant="secondary" 
      className={cn("flex items-center gap-1 px-2 py-1", config.className, className)}
      data-testid={`status-${status}`}
    >
      <Circle className={cn("h-2 w-2 fill-current", config.iconClassName)} />
      {config.label}
    </Badge>
  )
}
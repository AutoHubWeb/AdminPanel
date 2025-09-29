import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wrench, Server, Shield, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  change: number
  icon: React.ReactNode
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change > 0

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-5 w-5 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\\s+/g, '-')}`}>
          {value.toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          {isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
          )}
          <span className={isPositive ? "text-green-600" : "text-red-600"}>
            {Math.abs(change)}%
          </span>
          <span className="ml-1">từ tháng trước</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  // todo: remove mock data
  const stats = [
    {
      title: "Tổng User",
      value: 1247,
      change: 12.5,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Tổng Tool",
      value: 89,
      change: 5.2,
      icon: <Wrench className="h-4 w-4" />
    },
    {
      title: "Tổng VPS",
      value: 34,
      change: -2.3,
      icon: <Server className="h-4 w-4" />
    },
    {
      title: "Tổng Proxy",
      value: 156,
      change: 8.7,
      icon: <Shield className="h-4 w-4" />
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
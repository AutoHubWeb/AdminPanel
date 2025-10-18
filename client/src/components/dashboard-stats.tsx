import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wrench, Server, Shield } from "lucide-react"
import { useDashboardSummary } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  value: number | undefined
  icon: React.ReactNode
  isLoading?: boolean
}

function StatCard({ title, value, icon, isLoading }: StatCardProps) {
  if (isLoading) {
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
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (value === undefined) {
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
          <div className="text-2xl font-bold">-</div>
        </CardContent>
      </Card>
    )
  }

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
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const { data: summary, isLoading } = useDashboardSummary()

  const stats = summary ? [
    {
      title: "Tổng User",
      value: summary.totalUser,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Tổng Tool",
      value: summary.totalTool,
      icon: <Wrench className="h-4 w-4" />
    },
    {
      title: "Tổng VPS",
      value: summary.totalVps,
      icon: <Server className="h-4 w-4" />
    },
    {
      title: "Tổng Proxy",
      value: summary.totalProxy,
      icon: <Shield className="h-4 w-4" />
    }
  ] : []

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard 
          key={stat.title} 
          {...stat} 
          isLoading={isLoading}
        />
      ))}
      {stats.length === 0 && !isLoading && (
        <>
          {[1, 2, 3, 4].map((i) => (
            <StatCard 
              key={i}
              title=""
              value={undefined}
              icon={null}
              isLoading={true}
            />
          ))}
        </>
      )}
    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function Dashboard() {
  // Mock data for monthly revenue
  const revenueData = [
    { month: "T1", revenue: 12500000 },
    { month: "T2", revenue: 15300000 },
    { month: "T3", revenue: 18700000 },
    { month: "T4", revenue: 21200000 },
    { month: "T5", revenue: 24800000 },
    { month: "T6", revenue: 28900000 },
    { month: "T7", revenue: 32100000 },
    { month: "T8", revenue: 29500000 },
    { month: "T9", revenue: 34200000 },
    { month: "T10", revenue: 38600000 },
    { month: "T11", revenue: 42300000 },
    { month: "T12", revenue: 45800000 },
  ]

  // Mock data for new users per month
  const newUsersData = [
    { month: "T1", newUsers: 45 },
    { month: "T2", newUsers: 62 },
    { month: "T3", newUsers: 78 },
    { month: "T4", newUsers: 89 },
    { month: "T5", newUsers: 95 },
    { month: "T6", newUsers: 112 },
    { month: "T7", newUsers: 128 },
    { month: "T8", newUsers: 134 },
    { month: "T9", newUsers: 156 },
    { month: "T10", newUsers: 178 },
    { month: "T11", newUsers: 192 },
    { month: "T12", newUsers: 215 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>Biểu đồ doanh thu 12 tháng gần nhất (VNĐ)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle>Người dùng mới theo tháng</CardTitle>
            <CardDescription>Lượng người dùng đăng ký mới trong 12 tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={newUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} người`, 'Người dùng mới']}
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Bar 
                  dataKey="newUsers" 
                  fill="hsl(var(--chart-2))" 
                  name="Người dùng mới"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
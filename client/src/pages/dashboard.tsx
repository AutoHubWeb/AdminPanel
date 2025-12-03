import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { useDashboardRevenueSummary, useDashboardUserSummary } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  

  
  const { data: revenueData, isLoading: isRevenueLoading } = useDashboardRevenueSummary(selectedYear)
  const { data: userData, isLoading: isUserLoading } = useDashboardUserSummary(selectedYear)
  
  // Transform revenue data for chart
  const revenueChartData = revenueData?.timelines ? revenueData.timelines.map(item => ({
    month: `T${item.month}`,
    revenue: item.total
  })) : []
  
  // Transform user data for chart
  const userChartData = userData?.timelines ? userData.timelines.map(item => ({
    month: `T${item.month}`,
    newUsers: item.total
  })) : []

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
            {isRevenueLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}
                    labelFormatter={(label) => `Tháng ${label.replace('T', '')}`}
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
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle>Người dùng mới theo tháng</CardTitle>
            <CardDescription>Lượng người dùng đăng ký mới trong 12 tháng</CardDescription>
          </CardHeader>
          <CardContent>
            {isUserLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} người`, 'Người dùng mới']}
                    labelFormatter={(label) => `Tháng ${label.replace('T', '')}`}
                  />
                  <Bar 
                    dataKey="newUsers" 
                    fill="hsl(var(--chart-2))" 
                    name="Người dùng mới"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

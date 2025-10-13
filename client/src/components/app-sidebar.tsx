import { 
  Users, 
  Wrench, 
  Server, 
  Shield, 
  BarChart3,
  Settings,
  LogOut,
  CreditCard
} from "lucide-react"
import { Link, useLocation } from "wouter"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Quản lý User",
    url: "/users",
    icon: Users,
  },
  {
    title: "Quản lý Tool",
    url: "/tools",
    icon: Wrench,
  },
  {
    title: "Quản lý VPS",
    url: "/vps",
    icon: Server,
  },
  {
    title: "Quản lý Proxy",
    url: "/proxies",
    icon: Shield,
  },
  {
    title: "Giao dịch",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Cài đặt",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [location] = useLocation()
  const { logout } = useAuth()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\\s+/g, '-')}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              data-testid="button-logout"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

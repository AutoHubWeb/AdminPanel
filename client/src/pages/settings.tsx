import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { authApi } from "@/lib/api"
import { User, Lock, Shield, Clock } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  
  // Form states
  const [profileData, setProfileData] = useState({
    email: "",
    phone: "",
    fullName: "",
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Fetch admin information when component mounts
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setIsFetching(true)
        
        const response = await authApi.me()
        // The axios interceptor already extracts the data property, so we can use response.data directly
        const userData = response.data
        
        setProfileData({
          email: userData.email || "",
          phone: userData.phone || "",
          fullName: userData.fullname || userData.username || ""
        })
      } catch (err: any) {
        console.error("Error fetching admin info:", err)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin admin",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchAdminInfo()
  }, [toast])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await authApi.updateMe({
        fullname: profileData.fullName,
        phone: profileData.phone
      })
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công!",
      })
    } catch (err: any) {
      console.error("Error updating profile:", err)
      
      // Handle API error messages
      let errorMessage = "Có lỗi xảy ra khi cập nhật thông tin"
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp!",
        variant: "destructive",
      })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự!",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      await authApi.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công!",
      })
      
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      console.error("Error changing password:", err)
      
      // Handle API error messages
      let errorMessage = "Có lỗi xảy ra khi đổi mật khẩu"
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông tin Admin</h1>
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
          Thông tin Admin
        </h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin cá nhân và quản lý tài khoản
        </p>
      </div>

      <div className="grid gap-6">
        {/* Thông tin cá nhân */}
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Cập nhật thông tin liên hệ và hiển thị của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  data-testid="input-fullName"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} data-testid="button-update-profile">
                {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Đổi mật khẩu */}
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>
              Thay đổi mật khẩu để bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  data-testid="input-current-password"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    data-testid="input-new-password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} data-testid="button-change-password">
                {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

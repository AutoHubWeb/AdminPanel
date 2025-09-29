import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { EntityForm } from "@/components/entity-form" 
import type { User } from "@shared/schema"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Mock data for users
  const mockUsers: User[] = [
    {
      id: "1",
      username: "admin",
      email: "admin@example.com",
      phone: "0123456789",
      role: "admin",
      status: "active",
      lastLogin: new Date("2025-09-29T10:30:00Z"),
      createdAt: new Date("2025-09-20T08:00:00Z")
    },
    {
      id: "2",
      username: "nguyenvan",
      email: "nguyenvan@gmail.com",
      phone: "0987654321",
      role: "user",
      status: "active",
      lastLogin: new Date("2025-09-28T15:45:00Z"),
      createdAt: new Date("2025-09-15T14:30:00Z")
    },
    {
      id: "3",
      username: "tranthimai",
      email: "mai.tran@yahoo.com",
      phone: "0966778899",
      role: "user",
      status: "active",
      lastLogin: new Date("2025-09-27T09:15:00Z"),
      createdAt: new Date("2025-09-10T11:20:00Z")
    },
    {
      id: "4",
      username: "hoangminh",
      email: "hoangminh@outlook.com", 
      phone: null,
      role: "user",
      status: "inactive",
      lastLogin: new Date("2025-09-20T16:00:00Z"),
      createdAt: new Date("2025-08-25T13:45:00Z")
    },
    {
      id: "5",
      username: "lethihong",
      email: "hong.le@gmail.com",
      phone: "0912345678",
      role: "user", 
      status: "active",
      lastLogin: new Date("2025-09-29T08:20:00Z"),
      createdAt: new Date("2025-09-05T16:30:00Z")
    }
  ]

  const users = mockUsers
  const isLoading = false
  const error = null

  const columns = [
    { header: "Tên đăng nhập", accessor: "username" as keyof User },
    { header: "Email", accessor: "email" as keyof User },
    { 
      header: "Số điện thoại", 
      accessor: (user: User) => user.phone || "Chưa cập nhật"
    },
    { 
      header: "Ngày tham gia",
      accessor: (user: User) => user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
        : "Không xác định"
    },
    { 
      header: "Trạng thái khóa",
      accessor: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status === 'active' ? 'Không bị khóa' : 'Bị khóa'}
        </span>
      )
    }
  ]

  const formFields = [
    { name: "username", label: "Tên đăng nhập", type: "text" as const, required: true },
    { name: "email", label: "Email", type: "email" as const, required: true },
    { name: "phone", label: "Số điện thoại", type: "text" as const, required: false },
    {
      name: "status",
      label: "Trạng thái", 
      type: "select" as const,
      options: [
        { value: "active", label: "Hoạt động" },
        { value: "inactive", label: "Không hoạt động" }
      ]
    }
  ]

  const handleAdd = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = async (user: User) => {
    console.log("Deleting user:", user)
    toast({
      title: "Thành công",
      description: `Đã xóa user ${user.username} thành công`,
    })
  }

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Submitting user data:", data)
    
    if (editingUser) {
      toast({
        title: "Thành công",
        description: `Đã cập nhật user ${editingUser.username} thành công`,
      })
    } else {
      toast({
        title: "Thành công", 
        description: `Đã tạo user ${data.username} thành công`,
      })
    }
    setIsFormOpen(false)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu user</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý User"
        data={users}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm user..."
        searchKey="username"
      />

      <EntityForm
        title={editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
        description={editingUser ? "Cập nhật thông tin user" : "Tạo tài khoản user mới"}
        fields={formFields}
        initialData={editingUser || {}}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isLoading={false}
      />
    </div>
  )
}
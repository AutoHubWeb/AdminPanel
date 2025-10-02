import { useState, useCallback, useMemo } from "react"
import { DataTable } from "@/components/data-table"
import { EntityForm } from "@/components/entity-form" 
import type { User } from "@shared/schema"
import { useToast } from "@/hooks/use-toast"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers"

// Memoized DataTable component to prevent unnecessary re-renders
const UsersDataTable = ({
  users,
  columns,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSearch
}: {
  users: User[];
  columns: any[];
  handleAdd: () => void;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleSearch: (keyword: string) => void;
}) => (
  <DataTable
    title="Quản lý User"
    data={users}
    columns={columns}
    onAdd={handleAdd}
    onEdit={handleEdit}
    onDelete={handleDelete}
    searchPlaceholder="Tìm kiếm user..."
    searchKey="username"
    onSearch={handleSearch}
  />
);

// Memoized EntityForm component to prevent unnecessary re-renders
const UsersEntityForm = ({
  editingUser,
  isFormOpen,
  setIsFormOpen,
  formFields,
  handleSubmit
}: {
  editingUser: User | null;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  formFields: any[];
  handleSubmit: (data: Record<string, any>) => void;
}) => {
  // Transform user data to match form field names
  const initialData = editingUser ? {
    fullname: editingUser.username,
    email: editingUser.email,
    phone: editingUser.phone || "",
    // Note: password is not included for security reasons
  } : {};

  return (
    <EntityForm
      title={editingUser ? "Chỉnh sửa User" : "Thêm User mới"}
      description={editingUser ? "Cập nhật thông tin user" : "Tạo tài khoản user mới"}
      fields={formFields}
      initialData={initialData}
      isOpen={isFormOpen}
      onOpenChange={setIsFormOpen}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
};

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchKeyword, setSearchKeyword] = useState("")
  const { toast } = useToast()
  
  const { data: users = [], isLoading, error } = useUsers(searchKeyword)
  const { mutate: createUser } = useCreateUser()
  const { mutate: updateUser } = useUpdateUser()
  const { mutate: deleteUser } = useDeleteUser()

  // Memoize columns to prevent re-creation on each render
  const columns = useMemo(() => [
    { header: "Fullname", accessor: "username" as keyof User },
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
  ], []);

  // Memoize form fields to prevent re-creation on each render
  const formFields = useMemo(() => {
    const baseFields = [
      { name: "fullname", label: "Fullname", type: "text" as const, required: true },
      { name: "email", label: "Email", type: "email" as const, required: true },
    ];
    
    // Only include password field for new users, not for editing existing users
    if (!editingUser) {
      baseFields.push({ name: "password", label: "Mật khẩu", type: "text" as const, required: true });
    }
    
    baseFields.push({ name: "phone", label: "Số điện thoại", type: "text" as const, required: false });
    
    return baseFields;
  }, [editingUser]);

  const handleAdd = useCallback(() => {
    setEditingUser(null)
    setIsFormOpen(true)
  }, [setIsFormOpen]);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }, [setIsFormOpen]);

  const handleDelete = useCallback((user: User) => {
    deleteUser(user.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa user ${user.username} thành công`,
        })
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi xóa user ${user.username}`,
          variant: "destructive",
        })
        console.error("Error deleting user:", error)
      }
    })
  }, [deleteUser, toast]);

  const handleSubmit = useCallback((data: Record<string, any>) => {
    console.log("Submitting user data:", data)
    
    if (editingUser) {
      // Handle update user - only update fullname, email, and phone
      const userData = {
        fullname: data.fullname, // Send as fullname instead of username
        email: data.email,
        phone: data.phone || undefined,
        role: 0  // Add default role field with value 0 for updates as well
        // Password is intentionally excluded from updates
      };
      
      // Since the API client expects Partial<InsertUser> type, we need to cast to any
      // The server will handle mapping fullname to username
      updateUser({ id: editingUser.id, data: userData as any }, {
        onSuccess: (updatedUser) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật user ${updatedUser.username} thành công`,
          })
          setIsFormOpen(false)
        },
        onError: (error: any) => {
          console.error("Error updating user:", error)
          let errorMessage = "Có lỗi xảy ra khi cập nhật user"
          
          // Handle API error messages
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error
          }
          
          toast({
            title: "Lỗi",
            description: errorMessage,
            variant: "destructive",
          })
        }
      })
    } else {
      // Handle create user - map form data to send fullname instead of username
      const userData = {
        fullname: data.fullname, // Send fullname instead of username
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role: 0  // Add default role field with value 0
      };
      
      // Log the data being sent to verify role is included
      console.log("Sending user data with role:", userData);
      
      // Since the API client expects InsertUser type, we need to cast to any
      // In a real application, you would update the API or create a new endpoint
      createUser(userData as any, {
        onSuccess: (newUser) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo user ${newUser.username} thành công`,
          })
          setIsFormOpen(false)
        },
        onError: (error: any) => {
          console.error("Error creating user:", error)
          let errorMessage = "Có lỗi xảy ra khi tạo user"
          
          // Handle API error messages
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error
          }
          
          toast({
            title: "Lỗi",
            description: errorMessage,
            variant: "destructive",
          })
        }
      })
    }
  }, [editingUser, createUser, updateUser, toast, setIsFormOpen]);

  const handleSearch = useCallback((keyword: string) => {
    console.log("Search keyword:", keyword);
    setSearchKeyword(keyword)
  }, [])

  // Show loading only on initial load, not on search
  const showLoading = isLoading && !searchKeyword

  if (showLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải dữ liệu user...</p>
        </div>
      </div>
    )
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
      <UsersDataTable
        users={users}
        columns={columns}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleSearch={handleSearch}
      />

      <UsersEntityForm
        editingUser={editingUser}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        formFields={formFields}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

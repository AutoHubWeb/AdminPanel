import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useLockUser, useUnlockUser } from "@/hooks/useUsers";
import type { User } from "@shared/schema";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    role: "0", // Default to user (0) as string for form
    status: "active",
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const { data, isLoading, error, isFetching, refetch } = useUsers({
    keyword: searchKeyword || undefined,
    page: currentPage,
    limit: itemsPerPage
  });
  
  const userList = data?.items || [];
  const meta = data?.meta || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1
  };
  
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const lockUserMutation = useLockUser();
  const unlockUserMutation = useUnlockUser();

  const columns = [
    { header: "Tên người dùng", accessor: "username" as keyof User },
    { header: "Email", accessor: "email" as keyof User },
    { 
      header: "Vai trò", 
      accessor: (user: User) => (
        <span className={user.role === "admin" ? "font-bold text-blue-600" : ""}>
          {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
        </span>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: (user: User) => <StatusBadge status={user.status} />
    },
    { 
      header: "Hành động",
      accessor: (user: User) => (
        <div className="flex space-x-2">
          {user.status === "active" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleLockUser(user.id)}
              disabled={lockUserMutation.isPending}
            >
              Khóa
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUnlockUser(user.id)}
              disabled={unlockUserMutation.isPending}
            >
              Mở khóa
            </Button>
          )}
        </div>
      )
    },
    { 
      header: "Ngày tạo", 
      accessor: (user: User) => new Date(user.createdAt).toLocaleDateString("vi-VN")
    }
  ];

  // Update form data when editing
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullname: user.username,
      email: user.email,
      phone: user.phone || "",
      password: "", // Don't prefill password when editing
      role: user.role === "admin" ? "1" : "0", // Convert to string for form
      status: user.status,
    });
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      fullname: "",
      email: "",
      phone: "",
      password: "",
      role: "0", // Default to user (0) as string
      status: "active",
    });
    setIsFormOpen(true);
  };

  const handleDelete = (user: User) => {
    // Remove the browser's default confirmation dialog and use only our toast notifications
    deleteUserMutation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa người dùng ${user.username} thành công`,
        });
        // Refetch users after deletion
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi xóa người dùng ${user.username}`,
          variant: "destructive",
        });
        console.error("Error deleting user:", error);
      }
    });
  };

  const handleLockUser = (userId: string) => {
    lockUserMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã khóa người dùng thành công",
        });
        // Refetch users after locking
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi khóa người dùng",
          variant: "destructive",
        });
        console.error("Error locking user:", error);
      }
    });
  };

  const handleUnlockUser = (userId: string) => {
    unlockUserMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã mở khóa người dùng thành công",
        });
        // Refetch users after unlocking
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi mở khóa người dùng",
          variant: "destructive",
        });
        console.error("Error unlocking user:", error);
      }
    });
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (editingUser) {
      // Prepare data for API call with correct types
      const apiData = {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone || null,
        role: parseInt(formData.role), // Convert string to number for API
      };

      updateUserMutation.mutate({ 
        id: editingUser.id, 
        data: apiData
      }, {
        onSuccess: (updatedUser) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật người dùng ${updatedUser.username} thành công`,
          });
          setIsFormOpen(false);
          // Refetch users after update
          refetch();
        },
        onError: (error: any) => {
          console.error("Error updating user:", error);
          let errorMessage = "Có lỗi xảy ra khi cập nhật người dùng";
          
          // Handle API error messages
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          }
          
          toast({
            title: "Lỗi",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
    } else {
      // Prepare data for API call with correct types
      const apiData = {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password,
        role: parseInt(formData.role), // Convert string to number for API
      };

      createUserMutation.mutate(apiData, {
        onSuccess: (newUser) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo người dùng ${newUser.username} thành công`,
          });
          setIsFormOpen(false);
          // Refetch users after creation
          refetch();
        },
        onError: (error: any) => {
          console.error("Error creating user:", error);
          let errorMessage = "Có lỗi xảy ra khi tạo người dùng";
          
          // Handle API error messages
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          }
          
          toast({
            title: "Lỗi",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Show loading indicator only on initial load, not during subsequent searches or pagination
  const showLoading = isLoading && !searchKeyword && currentPage === 1;

  if (showLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Có lỗi xảy ra khi tải dữ liệu</h2>
        <p>Error: {(error as Error).message}</p>
        <p>Vui lòng kiểm tra console để biết thêm chi tiết.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý Người dùng"
        data={userList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm người dùng..."
        searchKey="username"
        onSearch={handleSearch}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Chỉnh sửa Người dùng" : "Thêm Người dùng mới"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Cập nhật thông tin người dùng" : "Thêm người dùng mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">
                  Tên người dùng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu {editingUser ? "" : <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required={!editingUser}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Người dùng</SelectItem>
                      <SelectItem value="1">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsFormOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {createUserMutation.isPending || updateUserMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {isFetching && (searchKeyword || currentPage > 1) && (
        <div className="text-center text-sm text-gray-500">Đang tải dữ liệu...</div>
      )}
      
      {meta.total > 0 && (
        <Pagination
          currentPage={meta.page || currentPage}
          totalPages={meta.totalPages || 1}
          totalItems={meta.total || 0}
          itemsPerPage={meta.limit || itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// Simple pagination component for users page
function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  totalItems: number; 
  itemsPerPage: number; 
  onPageChange: (page: number) => void; 
}) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  
  const handleFirstPage = () => onPageChange(1);
  const handlePreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLastPage = () => onPageChange(totalPages);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị từ {startIndex} đến {endIndex} trong tổng số {totalItems} kết quả
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          Trang {currentPage} / {totalPages}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

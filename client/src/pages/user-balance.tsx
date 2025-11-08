import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateUserBalance } from "@/hooks/useUsers";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Minus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { User } from "@shared/schema";

export default function UserBalancePage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBalanceFormOpen, setIsBalanceFormOpen] = useState(false);
  const [balanceData, setBalanceData] = useState({
    amount: 0,
    operation: 1, // 1 for add, -1 for subtract
    reason: "",
  });
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

  const updateUserBalanceMutation = useUpdateUserBalance();

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsBalanceFormOpen(true);
  };

  const handleBalanceInputChange = (name: string, value: string | number) => {
    setBalanceData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBalance = () => {
    if (!selectedUser) return;

    updateUserBalanceMutation.mutate(
      {
        id: selectedUser.id,
        data: {
          amount: balanceData.amount,
          operation: balanceData.operation,
          reason: balanceData.reason,
        },
      },
      {
        onSuccess: (response) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật số dư tài khoản cho người dùng ${selectedUser.username} thành công`,
          });
          setIsBalanceFormOpen(false);
          refetch();
        },
        onError: (error: any) => {
          console.error("Error updating user balance:", error);
          let errorMessage = "Cập nhật số dư thất bại";
          
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
        },
      }
    );
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
      <Card>
        <CardHeader>
          <CardTitle>Cập nhật số dư tài khoản người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm người dùng theo tên hoặc email..."
                  className="pl-10"
                  value={searchKeyword}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium">Tên người dùng</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Số điện thoại</th>
                  <th className="text-left p-4 font-medium">Số dư</th>
                  <th className="text-left p-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {userList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                ) : (
                  userList.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.phone || "N/A"}</td>
                      <td className="p-4">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(user.accountBalance ?? 0)}
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          onClick={() => handleSelectUser(user)}
                        >
                          Cập nhật số dư
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {meta.total > 0 && (
            <Pagination
              currentPage={meta.page || currentPage}
              totalPages={meta.totalPages || 1}
              totalItems={meta.total || 0}
              itemsPerPage={meta.limit || itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
          
          {isFetching && (searchKeyword || currentPage > 1) && (
            <div className="text-center text-sm text-gray-500 mt-4">Đang tải dữ liệu...</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isBalanceFormOpen} onOpenChange={setIsBalanceFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cập nhật số dư tài khoản</DialogTitle>
            <DialogDescription>
              {selectedUser && `Cập nhật số dư cho người dùng: ${selectedUser.username}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitBalance(); }}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Số tiền <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={balanceData.amount}
                  onChange={(e) => handleBalanceInputChange("amount", Number(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operation">Thao tác</Label>
                <Select
                  value={balanceData.operation.toString()}
                  onValueChange={(value) => handleBalanceInputChange("operation", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" className="flex items-center">
                      <Plus className="h-4 w-4 inline mr-2" />
                      Cộng tiền
                    </SelectItem>
                    <SelectItem value="-1" className="flex items-center">
                      <Minus className="h-4 w-4 inline mr-2" />
                      Trừ tiền
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={balanceData.reason}
                  onChange={(e) => handleBalanceInputChange("reason", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsBalanceFormOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={updateUserBalanceMutation.isPending}
              >
                {updateUserBalanceMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple pagination component for user balance page
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

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
import { Search, Plus, Minus } from "lucide-react";
import type { User } from "@shared/schema";

export default function UserBalancePage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBalanceFormOpen, setIsBalanceFormOpen] = useState(false);
  const [balanceData, setBalanceData] = useState({
    amount: 0,
    operation: 1, // 1 for add, -1 for subtract
    reason: "",
  });
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useUsers({
    keyword: searchKeyword || undefined,
  });

  const userList = data?.items || [];

  const updateUserBalanceMutation = useUpdateUserBalance();

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
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
    
    // Validate amount is positive
    if (balanceData.amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền phải lớn hơn 0",
        variant: "destructive",
      });
      return;
    }

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
          // Refetch users to get updated balance
          refetch();
        },
        onError: (error: any) => {
          console.error("Error updating user balance:", error);
          let errorMessage = "Có lỗi xảy ra khi cập nhật số dư tài khoản";
          
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

  if (isLoading) {
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

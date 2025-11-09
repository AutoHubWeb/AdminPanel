import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useProxies, useCreateProxy, useUpdateProxy, useDeleteProxy, useActivateProxy, usePauseProxy } from "@/hooks/useProxies"
import type { Proxy } from "@shared/schema"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export default function ProxiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    description: "",
    inventory: "",
    price: ""
  })
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  
  const { data, isLoading, error, isFetching, refetch } = useProxies({
    keyword: searchKeyword || undefined,
    page: currentPage,
    limit: itemsPerPage
  })
  
  const proxyList = data?.items || []
  const meta = data?.meta || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1
  }
  
  const createProxyMutation = useCreateProxy()
  const updateProxyMutation = useUpdateProxy()
  const deleteProxyMutation = useDeleteProxy()
  const activateProxyMutation = useActivateProxy()
  const pauseProxyMutation = usePauseProxy()

  const columns = [
    { header: "Tên Proxy", accessor: "name" as keyof Proxy },
    { 
      header: "Mô tả", 
      accessor: (proxy: Proxy) => (
        <div className="max-w-xs truncate" title={proxy.description || ""}>
          {proxy.description || "N/A"}
        </div>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: (proxy: Proxy) => (
        <div className="flex items-center space-x-2">
          <Select
            value={proxy.status.toString()}
            onValueChange={(value) => {
              const newStatus = Number(value);
              if (newStatus !== proxy.status) {
                if (newStatus === 1) {
                  // Activate the Proxy
                  activateProxyMutation.mutate(proxy.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã kích hoạt Proxy ${proxy.name}`,
                      });
                      // Refetch proxies after activation
                      refetch();
                    },
                    onError: (error: any) => {
                      console.error("Error activating Proxy:", error);
                      let errorMessage = "Có lỗi xảy ra khi kích hoạt Proxy";
                      
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
                  // Pause the Proxy
                  pauseProxyMutation.mutate(proxy.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã tạm dừng Proxy ${proxy.name}`,
                      });
                      // Refetch proxies after pausing
                      refetch();
                    },
                    onError: (error: any) => {
                      console.error("Error pausing Proxy:", error);
                      let errorMessage = "Có lỗi xảy ra khi tạm dừng Proxy";
                      
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
              }
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue>
                {proxy.status === 1 ? "hoạt động" : "không hoạt động"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">không hoạt động</SelectItem>
              <SelectItem value="1">hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    { 
      header: "Tồn kho",
      accessor: (proxy: Proxy) => proxy.inventory
    },
    { 
      header: "Thống kê",
      accessor: (proxy: Proxy) => (
        <div className="text-sm">
          <div>Đã bán: {proxy.soldQuantity}</div>
          <div>Lượt xem: {proxy.viewCount}</div>
        </div>
      )
    },
    { 
      header: "Giá",
      accessor: (proxy: Proxy) => {
        // Format price as VND currency
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(proxy.price);
      }
    }
  ]

  // Update form data when editing
  const handleEdit = (proxy: Proxy) => {
    setEditingProxy(proxy)
    setFormData({
      name: proxy.name || "",
      description: proxy.description || "",
      inventory: proxy.inventory?.toString() || "",
      price: proxy.price?.toString() || ""
    })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingProxy(null)
    setFormData({
      name: "",
      description: "",
      inventory: "",
      price: ""
    })
    setIsFormOpen(true)
  }

  const handleDelete = (proxy: Proxy) => {
    // Remove the browser's default confirmation dialog and use only our toast notifications
    deleteProxyMutation.mutate(proxy.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa Proxy ${proxy.name} thành công`,
        })
        // Refetch proxies after deletion
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi xóa Proxy ${proxy.name}`,
          variant: "destructive",
        })
        console.error("Error deleting Proxy:", error)
      }
    })
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    // Convert string values to numbers where needed
    const processedData = {
      ...formData,
      inventory: Number(formData.inventory),
      price: Number(formData.price)
    };
    
    if (editingProxy) {
      updateProxyMutation.mutate({ id: editingProxy.id, data: processedData }, {
        onSuccess: (updatedProxy) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật Proxy ${updatedProxy.name} thành công`,
          })
          setIsFormOpen(false)
          // Refetch proxies after update
          refetch();
        },
        onError: (error: any) => {
          console.error("Error updating Proxy:", error)
          let errorMessage = "Có lỗi xảy ra khi cập nhật Proxy"
          
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
      createProxyMutation.mutate(processedData, {
        onSuccess: (newProxy) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo Proxy ${newProxy.name} thành công`,
          })
          setIsFormOpen(false)
          // Refetch proxies after creation
          refetch();
        },
        onError: (error: any) => {
          console.error("Error creating Proxy:", error)
          let errorMessage = "Có lỗi xảy ra khi tạo Proxy"
          
          // Handle API error messages
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast({
            title: "Lỗi",
            description: errorMessage,
            variant: "destructive",
          })
        }
      })
    }
  }

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
    return <div>Đang tải dữ liệu...</div>
  }

  if (error) {
    console.error("Proxies Page Error:", error);
    return (
      <div>
        <h2>Có lỗi xảy ra khi tải dữ liệu</h2>
        <p>Error: {(error as Error).message}</p>
        <p>Vui lòng kiểm tra console để biết thêm chi tiết.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý Proxy"
        data={proxyList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm Proxy..."
        searchKey="name"
        onSearch={handleSearch}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProxy ? "Chỉnh sửa Proxy" : "Thêm Proxy mới"}</DialogTitle>
            <DialogDescription>
              {editingProxy ? "Cập nhật thông tin Proxy" : "Thêm Proxy mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên Proxy <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inventory">
                  Tồn kho <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => handleInputChange("inventory", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">
                  Giá (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                />
              </div>
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
                disabled={createProxyMutation.isPending || updateProxyMutation.isPending}
              >
                {createProxyMutation.isPending || updateProxyMutation.isPending ? "Đang lưu..." : "Lưu"}
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
  )
}

// Simple pagination component for proxies page
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

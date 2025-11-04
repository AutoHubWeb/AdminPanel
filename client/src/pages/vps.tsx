import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useVps, useCreateVps, useUpdateVps, useDeleteVps, useActivateVps, usePauseVps } from "@/hooks/useVps"
import type { Vps } from "@shared/schema"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export default function VpsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVps, setEditingVps] = useState<Vps | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    description: "",
    ram: "",
    disk: "",
    cpu: "",
    bandwidth: "",
    location: "",
    os: "",
    tags: "",
    price: ""
  })
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  
  const { data, isLoading, error, isFetching, refetch } = useVps({
    keyword: searchKeyword || undefined,
    page: currentPage,
    limit: itemsPerPage
  })
  
  const vpsList = data?.items || []
  const meta = data?.meta || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1
  }
  
  // Add debugging
  console.log("VPS List:", vpsList);
  console.log("Is Array:", Array.isArray(vpsList));
  console.log("Length:", vpsList.length);

  const createVpsMutation = useCreateVps()
  const updateVpsMutation = useUpdateVps()
  const deleteVpsMutation = useDeleteVps()
  const activateVpsMutation = useActivateVps()
  const pauseVpsMutation = usePauseVps()

  const columns = [
    { header: "Tên VPS", accessor: "name" as keyof Vps },
    { 
      header: "Mô tả", 
      accessor: (vps: Vps) => (
        <div className="max-w-xs truncate" title={vps.description || ""}>
          {vps.description || "N/A"}
        </div>
      )
    },
    { 
      header: "Vị trí", 
      accessor: (vps: Vps) => (
        <Badge variant="outline">{vps.location || "N/A"}</Badge>
      )
    },
    { 
      header: "Hệ điều hành", 
      accessor: (vps: Vps) => vps.os || "N/A"
    },
    { 
      header: "Trạng thái", 
      accessor: (vps: Vps) => (
        <div className="flex items-center space-x-2">
          <Select
            value={vps.status.toString()}
            onValueChange={(value) => {
              const newStatus = Number(value);
              if (newStatus !== vps.status) {
                if (newStatus === 1) {
                  // Activate the VPS
                  activateVpsMutation.mutate(vps.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã kích hoạt VPS ${vps.name}`,
                      });
                      // Refetch VPS after activation
                      refetch();
                    },
                    onError: (error: any) => {
                      console.error("Error activating VPS:", error);
                      let errorMessage = "Có lỗi xảy ra khi kích hoạt VPS";
                      
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
                  // Pause the VPS
                  pauseVpsMutation.mutate(vps.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã tạm dừng VPS ${vps.name}`,
                      });
                      // Refetch VPS after pausing
                      refetch();
                    },
                    onError: (error: any) => {
                      console.error("Error pausing VPS:", error);
                      let errorMessage = "Có lỗi xảy ra khi tạm dừng VPS";
                      
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
                {vps.status === 1 ? "hoạt động" : "không hoạt động"}
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
      header: "Tags",
      accessor: (vps: Vps) => {
        if (!vps.tags || vps.tags.length === 0) return "N/A";
        return (
          <div className="flex flex-wrap gap-1">
            {vps.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      }
    },
    { 
      header: "Cấu hình",
      accessor: (vps: Vps) => (
        <div className="text-sm">
          <div>CPU: {vps.cpu} cores</div>
          <div>RAM: {vps.ram} GB</div>
          <div>Disk: {vps.disk} GB</div>
        </div>
      )
    },
    { 
      header: "Bandwidth",
      accessor: (vps: Vps) => `${vps.bandwidth} GB/tháng`
    },
    { 
      header: "Thống kê",
      accessor: (vps: Vps) => (
        <div className="text-sm">
          <div>Đã bán: {vps.soldQuantity}</div>
          <div>Lượt xem: {vps.viewCount}</div>
        </div>
      )
    },
    { 
      header: "Giá",
      accessor: (vps: Vps) => {
        // Format price as VND currency
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(vps.price);
      }
    }
  ]

  // Update form data when editing
  const handleEdit = (vps: Vps) => {
    setEditingVps(vps)
    setFormData({
      name: vps.name || "",
      description: vps.description || "",
      ram: vps.ram?.toString() || "",
      disk: vps.disk?.toString() || "",
      cpu: vps.cpu?.toString() || "",
      bandwidth: vps.bandwidth?.toString() || "",
      location: vps.location || "",
      os: vps.os || "",
      tags: vps.tags?.join(", ") || "",
      price: vps.price?.toString() || ""
    })
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingVps(null)
    setFormData({
      name: "",
      description: "",
      ram: "",
      disk: "",
      cpu: "",
      bandwidth: "",
      location: "",
      os: "",
      tags: "",
      price: ""
    })
    setIsFormOpen(true)
  }

  const handleDelete = (vps: Vps) => {
    // Remove the browser's default confirmation dialog and use only our toast notifications
    deleteVpsMutation.mutate(vps.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa VPS ${vps.name} thành công`,
        })
        // Refetch VPS after deletion
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi xóa VPS ${vps.name}`,
          variant: "destructive",
        })
        console.error("Error deleting VPS:", error)
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
      ram: Number(formData.ram),
      disk: Number(formData.disk),
      cpu: Number(formData.cpu),
      bandwidth: Number(formData.bandwidth),
      price: Number(formData.price),
      tags: formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()) : []
    };
    
    if (editingVps) {
      updateVpsMutation.mutate({ id: editingVps.id, data: processedData }, {
        onSuccess: (updatedVps) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật VPS ${updatedVps.name} thành công`,
          })
          setIsFormOpen(false)
          // Refetch VPS after update
          refetch();
        },
        onError: (error: any) => {
          console.error("Error updating VPS:", error)
          let errorMessage = "Có lỗi xảy ra khi cập nhật VPS"
          
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
      createVpsMutation.mutate(processedData, {
        onSuccess: (newVps) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo VPS ${newVps.name} thành công`,
          })
          setIsFormOpen(false)
          // Refetch VPS after creation
          refetch();
        },
        onError: (error: any) => {
          console.error("Error creating VPS:", error)
          let errorMessage = "Có lỗi xảy ra khi tạo VPS"
          
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
    console.error("VPS Page Error:", error);
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
        title="Quản lý VPS"
        data={vpsList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm VPS..."
        searchKey="name"
        onSearch={handleSearch}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingVps ? "Chỉnh sửa VPS" : "Thêm VPS mới"}</DialogTitle>
            <DialogDescription>
              {editingVps ? "Cập nhật thông tin VPS" : "Thêm VPS mới vào hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Left Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tên VPS <span className="text-red-500">*</span>
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
                      <Label htmlFor="location">Vị trí</Label>
                      <Input
                        id="location"
                        placeholder="Nhập vị trí"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="os">Hệ điều hành</Label>
                      <Input
                        id="os"
                        placeholder="Nhập hệ điều hành"
                        value={formData.os}
                        onChange={(e) => handleInputChange("os", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="Nhập tags, phân cách bằng dấu phẩy"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Ví dụ: premium, ai, ml</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Cấu hình</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpu">
                          CPU (cores) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cpu"
                          type="number"
                          value={formData.cpu}
                          onChange={(e) => handleInputChange("cpu", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ram">
                          RAM (GB) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ram"
                          type="number"
                          value={formData.ram}
                          onChange={(e) => handleInputChange("ram", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="disk">
                          Disk (GB) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="disk"
                          type="number"
                          value={formData.disk}
                          onChange={(e) => handleInputChange("disk", e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bandwidth">
                          Bandwidth (GB/tháng) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bandwidth"
                          type="number"
                          value={formData.bandwidth}
                          onChange={(e) => handleInputChange("bandwidth", e.target.value)}
                          required
                        />
                      </div>
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
                  </CardContent>
                </Card>
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
                disabled={createVpsMutation.isPending || updateVpsMutation.isPending}
              >
                {createVpsMutation.isPending || updateVpsMutation.isPending ? "Đang lưu..." : "Lưu"}
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

// Simple pagination component for VPS page
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

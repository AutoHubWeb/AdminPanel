import { useState, useRef } from "react"
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
import { useTools, useCreateTool, useUpdateTool, useDeleteTool, useActivateTool, usePauseTool } from "@/hooks/useTools"
import type { Tool } from "@shared/schema"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface Plan {
  name: string;
  price: string;
  duration: string;
}

export default function ToolsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    demo: "",
    slug: "",
    status: 1,
    plans: [
      { name: "", price: "", duration: "" },
      { name: "", price: "", duration: "" },
      { name: "", price: "", duration: "" }
    ] as Plan[],
    images: [] as File[] // Store uploaded images
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  
  const { data, isLoading, error, isFetching, refetch } = useTools({
    keyword: searchKeyword || undefined,
    page: currentPage,
    limit: itemsPerPage
  })
  
  const toolList = data?.items || []
  const meta = data?.meta || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1
  }
  
  // Add debugging
  console.log("Tool List:", toolList);
  console.log("Is Array:", Array.isArray(toolList));
  console.log("Length:", toolList.length);

  const createToolMutation = useCreateTool()
  const updateToolMutation = useUpdateTool()
  const deleteToolMutation = useDeleteTool()
  const activateToolMutation = useActivateTool()
  const pauseToolMutation = usePauseTool()

  const columns = [
    { header: "Tên Tool", accessor: "name" as keyof Tool },
    { 
      header: "Mô tả", 
      accessor: (tool: Tool) => (
        <div className="max-w-xs truncate" title={tool.description || ""}>
          {tool.description || "N/A"}
        </div>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: (tool: Tool) => (
        <div className="flex items-center space-x-2">
          <Select
            value={tool.status.toString()}
            onValueChange={(value) => {
              const newStatus = Number(value);
              if (newStatus !== tool.status) {
                if (newStatus === 1) {
                  // Activate the Tool
                  activateToolMutation.mutate(tool.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã kích hoạt Tool ${tool.name}`,
                      });
                      // Refetch tools after activation
                      refetch();
                    },
                    onError: (error: any) => {
                      console.error("Error activating Tool:", error);
                      let errorMessage = "Có lỗi xảy ra khi kích hoạt Tool";
                      
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
                  // Pause the Tool
                  pauseToolMutation.mutate(tool.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã tạm dừng Tool ${tool.name}`,
                      });
                      // Refetch tools after pausing
                      refetch();
                    },
                    onError: (error: any) => {
                      console.error("Error pausing Tool:", error);
                      let errorMessage = "Có lỗi xảy ra khi tạm dừng Tool";
                      
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
                {tool.status === 1 ? "hoạt động" : "không hoạt động"}
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
      header: "Thống kê",
      accessor: (tool: Tool) => (
        <div className="text-sm">
          <div>Đã bán: {tool.soldQuantity}</div>
          <div>Lượt xem: {tool.viewCount}</div>
        </div>
      )
    }
  ]

  // Update form data when editing
  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name || "",
      code: tool.code || "",
      description: tool.description || "",
      demo: tool.demo || "",
      slug: tool.slug || "",
      status: tool.status,
      plans: [
        { name: "", price: "", duration: "" },
        { name: "", price: "", duration: "" },
        { name: "", price: "", duration: "" }
      ],
      images: [] // Reset images when editing
    })
    setUploadedFiles([])
    setPreviewUrls([])
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingTool(null)
    setFormData({
      name: "",
      code: "",
      description: "",
      demo: "",
      slug: "",
      status: 1,
      plans: [
        { name: "", price: "", duration: "" },
        { name: "", price: "", duration: "" },
        { name: "", price: "", duration: "" }
      ],
      images: [] // Reset images when adding new
    })
    setUploadedFiles([])
    setPreviewUrls([])
    setIsFormOpen(true)
  }

  const handleDelete = (tool: Tool) => {
    // Remove the browser's default confirmation dialog and use only our toast notifications
    deleteToolMutation.mutate(tool.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa Tool ${tool.name} thành công`,
        })
        // Refetch tools after deletion
        refetch();
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi xóa Tool ${tool.name}`,
          variant: "destructive",
        })
        console.error("Error deleting Tool:", error)
      }
    })
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlanChange = (index: number, field: keyof Plan, value: string) => {
    const updatedPlans = [...formData.plans]
    updatedPlans[index] = { ...updatedPlans[index], [field]: value }
    setFormData(prev => ({ ...prev, plans: updatedPlans }))
  }

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      
      // Limit to 5 files
      if (files.length > 5) {
        toast({
          title: "Lỗi",
          description: "Bạn chỉ có thể chọn tối đa 5 tệp.",
          variant: "destructive",
        })
        return
      }
      
      setUploadedFiles(files)
      // Create preview URLs for images
      const urls = files.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  const removeImage = (index: number) => {
    const newFiles = [...uploadedFiles]
    const newUrls = [...previewUrls]
    newFiles.splice(index, 1)
    newUrls.splice(index, 1)
    setUploadedFiles(newFiles)
    setPreviewUrls(newUrls)
  }

  const handleSubmit = () => {
    // Convert string values to numbers where needed
    const processedPlans = formData.plans.map((plan) => ({
      name: plan.name,
      price: Number(plan.price),
      duration: Number(plan.duration)
    }));
    
    // Create FormData for file uploads
    const formDataObj = new FormData();
    formDataObj.append('name', formData.name);
    formDataObj.append('code', formData.code);
    formDataObj.append('description', formData.description);
    formDataObj.append('demo', formData.demo);
    formDataObj.append('slug', formData.slug);
    formDataObj.append('status', formData.status.toString());
    formDataObj.append('plans', JSON.stringify(processedPlans));
    
    // Append files to form data
    uploadedFiles.forEach((file) => {
      formDataObj.append(`images`, file);
    });
    
    if (editingTool) {
      updateToolMutation.mutate({ id: editingTool.id, data: formDataObj }, {
        onSuccess: (updatedTool) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật Tool ${updatedTool.name} thành công`,
          })
          setIsFormOpen(false)
          // Refetch tools after update
          refetch();
        },
        onError: (error: any) => {
          console.error("Error updating Tool:", error)
          let errorMessage = "Có lỗi xảy ra khi cập nhật Tool"
          
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
      createToolMutation.mutate(formDataObj, {
        onSuccess: (newTool) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo Tool ${newTool.name} thành công`,
          })
          setIsFormOpen(false)
          // Refetch tools after creation
          refetch();
        },
        onError: (error: any) => {
          console.error("Error creating Tool:", error)
          let errorMessage = "Có lỗi xảy ra khi tạo Tool"
          
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
    console.error("Tools Page Error:", error);
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
        title="Quản lý Tool"
        data={toolList}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm Tool..."
        searchKey="name"
        onSearch={handleSearch}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingTool ? "Chỉnh sửa Tool" : "Thêm Tool mới"}</DialogTitle>
            <DialogDescription>
              {editingTool ? "Cập nhật thông tin Tool" : "Thêm Tool mới vào hệ thống"}
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
                        Tên Tool <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="code">
                        Mã Tool <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => handleInputChange("code", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug">
                        Slug <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange("slug", e.target.value)}
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
                      <Label htmlFor="demo">Link Demo</Label>
                      <Input
                        id="demo"
                        value={formData.demo}
                        onChange={(e) => handleInputChange("demo", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Kế hoạch giá</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.plans.map((plan, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor={`plan-name-${index}`}>Tên</Label>
                          <Input
                            id={`plan-name-${index}`}
                            value={plan.name}
                            onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                            placeholder="Ví dụ: 1 Tháng"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`plan-price-${index}`}>Giá (VND)</Label>
                          <Input
                            id={`plan-price-${index}`}
                            type="number"
                            value={plan.price}
                            onChange={(e) => handlePlanChange(index, "price", e.target.value)}
                            placeholder="Ví dụ: 10000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`plan-duration-${index}`}>Thời hạn (ngày)</Label>
                          <Input
                            id={`plan-duration-${index}`}
                            type="number"
                            value={plan.duration}
                            onChange={(e) => handlePlanChange(index, "duration", e.target.value)}
                            placeholder="Ví dụ: 30"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="status">Hoạt động</Label>
                      <Switch
                        id="status"
                        checked={formData.status === 1}
                        onCheckedChange={(checked) => handleInputChange("status", checked ? "1" : "0")}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Hình ảnh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFileButtonClick}
                      className="w-full"
                    >
                      Chọn tệp
                    </Button>
                    {previewUrls.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Đã chọn {previewUrls.length} tệp
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={url} 
                                alt={`Preview ${index}`} 
                                className="w-full h-20 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                disabled={createToolMutation.isPending || updateToolMutation.isPending}
              >
                {createToolMutation.isPending || updateToolMutation.isPending ? "Đang lưu..." : "Lưu"}
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

// Simple pagination component for tools page
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

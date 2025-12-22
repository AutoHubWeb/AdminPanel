import { useState, useRef } from "react"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
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
import { Pagination } from "@/components/pagination"
import { useToast } from "@/hooks/use-toast"
import { useTools, useCreateTool, useUpdateTool, useDeleteTool, useActivateTool, usePauseTool } from "@/hooks/useTools"
import { toolApi } from "@/lib/api"
import { ToolForm } from "@/components/tool-form" // Import ToolForm component
import { SafeHtml } from "@/components/safe-html" // Import SafeHtml component
import type { Tool } from "@shared/schema"
import { fileApi } from "@/lib/api"
interface Plan {
  name: string;
  price: string;
  duration: string;
}

// Add interface for image data
interface ImageData {
  id: string;
  fileUrl: string;
  fileName: string;
}

export default function ToolsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    demo: "",
    linkDownload: "",
    plans: [
      { name: "", price: "", duration: "" },
      { name: "", price: "", duration: "" },
      { name: "", price: "", duration: "" }
    ] as Plan[],
    images: [] as ImageData[], // Add images array
    imageIds: [] as string[] // Store uploaded image IDs instead of files
  })
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
          <SafeHtml html={tool.description || "N/A"} />
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
                      // Use refetch instead of reload to update the list
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
                      // Use refetch instead of reload to update the list
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
  const handleEdit = async (tool: Tool) => {
    setEditingTool(tool)
    setIsDetailLoading(true)
    
    try {
      // Fetch detailed tool data
      const response = await toolApi.detail(tool.id)
      const detailedTool = response.data
    
      // Prepare plans data
      const plansData = detailedTool.plans && detailedTool.plans.length > 0 
        ? detailedTool.plans.map((plan: any) => ({
          name: plan.name || "",
          price: plan.price?.toString() || "",
          duration: plan.duration?.toString() || ""
        }))
      : [
          { name: "", price: "", duration: "" },
          { name: "", price: "", duration: "" },
          { name: "", price: "", duration: "" }
        ]
    
    // Prepare images data
    const imagesData = detailedTool.images && detailedTool.images.length > 0
      ? detailedTool.images.map((img: any) => ({
          id: img.id,
          fileUrl: img.fileUrl?.startsWith('http') 
            ? img.fileUrl 
            : `${API_BASE_URL}/files${img.fileUrl || ''}`,
          fileName: img.fileName || img.originalName || 'Existing image'
        }))
      : []
    
    setFormData({
      name: detailedTool.name || "",
      code: detailedTool.code || "",
      description: detailedTool.description || "",
      demo: detailedTool.demo || "",
      linkDownload: detailedTool.linkDownload || "",
      plans: plansData,
      images: imagesData, // Pass images data to form
      imageIds: [] // Reset image IDs when editing
    })
    setIsFormOpen(true)
  } catch (error) {
    console.error("Error fetching tool details:", error)
    toast({
      title: "Lỗi",
      description: "Không thể tải thông tin chi tiết tool",
      variant: "destructive",
    })
    // Fallback to basic data
    setFormData({
      name: tool.name || "",
      code: tool.code || "",
      description: tool.description || "",
      demo: tool.demo || "",
      linkDownload: tool.linkDownload || "",
      plans: [
        { name: "", price: "", duration: "" },
        { name: "", price: "", duration: "" },
        { name: "", price: "", duration: "" }
      ],
      images: [], // Reset images when error
      imageIds: []
    })
    setIsFormOpen(true)
  } finally {
    setIsDetailLoading(false)
  }
}

const handleAdd = () => {
  setEditingTool(null)
  setFormData({
    name: "",
    code: "",
    description: "",
    demo: "",
    linkDownload: "",
    plans: [
      { name: "", price: "", duration: "" },
      { name: "", price: "", duration: "" },
      { name: "", price: "", duration: "" }
    ],
    images: [], // Reset images when adding new
    imageIds: [] // Reset image IDs when adding new
  })
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
      // Use refetch instead of reload to update the list
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
  // This function is no longer needed as file handling is done in ToolForm component
}

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // This function is no longer needed as file handling is done in ToolForm component
}

const removeImage = (index: number) => {
  // This function is no longer needed as image handling is done in ToolForm component
}

const handleSubmit = (toolData: any) => {
  // toolData already contains properly formatted data from ToolForm component
  // including imageIds and processed plans
    
  if (editingTool) {
      updateToolMutation.mutate({ id: editingTool.id, data: toolData }, {
        onSuccess: (updatedTool: any) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật Tool ${updatedTool.name} thành công`,
          })
          setIsFormOpen(false)
          // Use refetch instead of reload to update the list
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
      createToolMutation.mutate(toolData, {
        onSuccess: (newTool: any) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo Tool ${newTool.name} thành công`,
          })
          setIsFormOpen(false)
          // Use refetch instead of reload to update the list
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

      {/* Use Dialog with ToolForm component inside */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <ToolForm
            title={editingTool ? "Chỉnh sửa Tool" : "Thêm Tool mới"}
            description={editingTool ? "Cập nhật thông tin Tool" : "Thêm Tool mới vào hệ thống"}
            initialData={formData}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleSubmit}
            isLoading={isDetailLoading} // Pass the loading state
          />
        </DialogContent>
      </Dialog>
    </div>
  )}

// Get base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
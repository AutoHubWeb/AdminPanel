import { useState, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { ToolForm } from "@/components/tool-form"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, TrendingUp, DollarSign } from "lucide-react"
import type { Tool } from "@shared/schema"
import { useTools, useCreateTool, useUpdateTool, useDeleteTool, useActivateTool, usePauseTool } from "@/hooks/useTools"
import { useToast } from "@/hooks/use-toast"
import { toolApi } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Extended Tool type to include API response fields
interface ExtendedTool extends Tool {
  images?: Array<{
    id: string;
    fileUrl: string;
  }>;
  plans?: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
}

export default function ToolsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<ExtendedTool | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const { toast } = useToast()
  
  const { data: tools = [], isLoading, error } = useTools()
  const { mutate: createTool } = useCreateTool()
  const { mutate: updateTool } = useUpdateTool()
  const { mutate: deleteTool } = useDeleteTool()
  const { mutate: activateTool } = useActivateTool()
  const { mutate: pauseTool } = usePauseTool()

  const columns = [
    { 
      header: "Mã Tool", 
      accessor: "code" as keyof ExtendedTool,
      className: "font-mono font-semibold"
    },
    { 
      header: "Tên Tool", 
      accessor: "name" as keyof ExtendedTool,
      className: "font-medium"
    },
    { header: "Mô tả", accessor: "description" as keyof ExtendedTool },
    { 
      header: "Gói giá", 
      accessor: (tool: ExtendedTool) => {
        if (!tool.plans?.length) {
          return <span className="text-muted-foreground">Chưa có gói</span>
        }
        
        return (
          <div className="space-y-1">
            {tool.plans.map((plan, index) => (
              <div key={index} className="flex items-center gap-1 text-sm">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="font-medium">{plan.price.toLocaleString('vi-VN')}đ</span>
                <span className="text-muted-foreground">- {plan.name}</span>
              </div>
            ))}
          </div>
        )
      }
    },
    { 
      header: "Thống kê", 
      accessor: (tool: ExtendedTool) => (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-medium">{tool.soldQuantity || 0}</span>
            <span className="text-muted-foreground">bán</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{tool.viewCount || 0}</span>
            <span className="text-muted-foreground">lượt xem</span>
          </div>
        </div>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: (tool: ExtendedTool) => (
        <div className="flex items-center space-x-2">
          <Select
            value={tool.status.toString()}
            onValueChange={(value) => {
              const newStatus = Number(value);
              if (newStatus !== tool.status) {
                if (newStatus === 1) {
                  // Activate the tool
                  activateTool(tool.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã kích hoạt tool ${tool.name}`,
                      });
                    },
                    onError: (error: any) => {
                      console.error("Error activating tool:", error);
                      let errorMessage = "Có lỗi xảy ra khi kích hoạt tool";
                      
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
                  // Pause the tool
                  pauseTool(tool.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã tạm dừng tool ${tool.name}`,
                      });
                    },
                    onError: (error: any) => {
                      console.error("Error pausing tool:", error);
                      let errorMessage = "Có lỗi xảy ra khi tạm dừng tool";
                      
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
                {tool.status === 1 ? "Hoạt động" : "Không hoạt động"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Hoạt động</SelectItem>
              <SelectItem value="0">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    { 
      header: "Demo",
      accessor: (tool: ExtendedTool) => tool.demo ? (
        <Button variant="ghost" size="sm" asChild>
          <a href={tool.demo} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      ) : (
        <span className="text-muted-foreground">Không có</span>
      )
    },
    {
      header: "Ngày tạo",
      accessor: (tool: ExtendedTool) => new Date(tool.createdAt).toLocaleDateString('vi-VN')
    }
  ]

  const handleAdd = () => {
    setEditingTool(null)
    setIsFormOpen(true)
  }

  const handleEdit = async (tool: ExtendedTool) => {
    setLoadingDetail(true)
    try {
      // Fetch detailed tool data from API
      const response = await toolApi.detail(tool.id)
      console.log("Tool detail response:", response)
      
      // Handle the response structure
      let toolDetail: ExtendedTool;
      if (response.data && response.data.data) {
        // New structure with data wrapper
        toolDetail = response.data.data
      } else if (response.data && response.data.id) {
        // Old structure directly
        toolDetail = response.data
      } else {
        throw new Error("Unexpected response structure")
      }
      
      setEditingTool(toolDetail)
      setIsFormOpen(true)
    } catch (error) {
      console.error("Error fetching tool detail:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin chi tiết tool",
        variant: "destructive",
      })
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDelete = (tool: ExtendedTool) => {
    deleteTool(tool.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa tool ${tool.name} thành công`,
        });
      },
      onError: (error: any) => {
        console.error("Error deleting tool:", error);
        let errorMessage = "Có lỗi xảy ra khi xóa tool";
        
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

  const handleSubmit = useCallback((data: Record<string, any>) => {
    console.log("Submitting tool data:", data);

    if (editingTool) {
      // Update existing tool
      updateTool({ id: editingTool.id, data }, {
        onSuccess: (updatedTool) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật tool ${updatedTool.name} thành công`,
          });
          setIsFormOpen(false);
        },
        onError: (error: any) => {
          console.error("Error updating tool:", error);
          let errorMessage = "Có lỗi xảy ra khi cập nhật tool";
          
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
      // Create new tool
      createTool(data, {
        onSuccess: (newTool) => {
          toast({
            title: "Thành công",
            description: `Đã tạo tool ${newTool.name} thành công`,
          });
          setIsFormOpen(false);
        },
        onError: (error: any) => {
          console.error("Error creating tool:", error);
          let errorMessage = "Có lỗi xảy ra khi tạo tool";
          
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
  }, [editingTool, createTool, updateTool, toast, setIsFormOpen]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải dữ liệu tool...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu tool</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý Tool"
        data={tools}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm tool..."
        searchKey="name"
      />

      <ToolForm
        title={editingTool ? "Chỉnh sửa Tool" : "Thêm Tool mới"}
        description={editingTool ? "Cập nhật thông tin tool" : "Thêm tool mới vào hệ thống"}
        initialData={editingTool || {}}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isLoading={loadingDetail}
      />
    </div>
  )
}

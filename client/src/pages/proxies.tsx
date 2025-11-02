import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { EntityForm } from "@/components/entity-form"
import { ProxyDetailModal } from "@/components/proxy-detail-modal"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Proxy } from "@shared/schema"
import { useProxies, useCreateProxy, useUpdateProxy, useDeleteProxy, useActivateProxy, usePauseProxy } from "@/hooks/useProxies"
import { useToast } from "@/hooks/use-toast"

export default function ProxiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedProxyId, setSelectedProxyId] = useState<string | null>(null)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const { toast } = useToast()
  
  const { data: proxies = [], isLoading, error } = useProxies()
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
      header: "Giá",
      accessor: (proxy: Proxy) => {
        // Format price as VND currency
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(proxy.price || 0);
      }
    },
    { 
      header: "Tồn kho",
      accessor: (proxy: Proxy) => proxy.inventory || 0
    },
    { 
      header: "Đã bán",
      accessor: (proxy: Proxy) => proxy.soldQuantity || 0
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
                  // Activate the proxy
                  activateProxyMutation.mutate(proxy.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã kích hoạt proxy ${proxy.name}`,
                      });
                    },
                    onError: (error: any) => {
                      console.error("Error activating proxy:", error);
                      let errorMessage = "Có lỗi xảy ra khi kích hoạt proxy";
                      
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
                  // Pause the proxy
                  pauseProxyMutation.mutate(proxy.id, {
                    onSuccess: () => {
                      toast({
                        title: "Thành công",
                        description: `Đã tạm dừng proxy ${proxy.name}`,
                      });
                    },
                    onError: (error: any) => {
                      console.error("Error pausing proxy:", error);
                      let errorMessage = "Có lỗi xảy ra khi tạm dừng proxy";
                      
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
                {proxy.status === 1 ? "Active" : "Inactive"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    { 
      header: "Ngày tạo",
      accessor: (proxy: Proxy) => {
        if (!proxy.createdAt) return "N/A";
        return new Date(proxy.createdAt).toLocaleDateString('vi-VN');
      }
    }
  ]

  const formFields = [
    { name: "name", label: "Tên Proxy", type: "text" as const, required: true },
    { name: "description", label: "Mô tả", type: "textarea" as const },
    { name: "price", label: "Giá (VND)", type: "number" as const, required: true },
    { name: "inventory", label: "Tồn kho", type: "number" as const, required: true }
  ]

  const handleAdd = () => {
    setEditingProxy(null)
    setIsFormOpen(true)
  }

  const handleEdit = (proxy: Proxy) => {
    setEditingProxy(proxy)
    setIsFormOpen(true)
  }

  const handleViewDetail = (proxy: Proxy) => {
    setSelectedProxyId(proxy.id)
    setIsDetailOpen(true)
  }

  const handleDelete = (proxy: Proxy) => {
    deleteProxyMutation.mutate(proxy.id, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: `Đã xóa proxy ${proxy.name} thành công`,
        })
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: `Có lỗi xảy ra khi xóa proxy ${proxy.name}`,
          variant: "destructive",
        })
        console.error("Error deleting proxy:", error)
      }
    })
  }

  const handleSubmit = (data: Record<string, any>) => {
    // Transform form data to match API expectations
    const submitData = {
      name: data.name,
      description: data.description,
      inventory: Number(data.inventory),
      price: Number(data.price)
    }
    
    if (editingProxy) {
      updateProxyMutation.mutate({ id: editingProxy.id, data: submitData }, {
        onSuccess: (updatedProxy) => {
          toast({
            title: "Thành công",
            description: `Đã cập nhật proxy ${updatedProxy.name} thành công`,
          })
          setIsFormOpen(false)
        },
        onError: (error: any) => {
          console.error("Error updating proxy:", error)
          let errorMessage = "Có lỗi xảy ra khi cập nhật proxy"
          
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
      createProxyMutation.mutate(submitData, {
        onSuccess: (newProxy) => {
          toast({
            title: "Thành công", 
            description: `Đã tạo proxy ${newProxy.name} thành công`,
          })
          setIsFormOpen(false)
        },
        onError: (error: any) => {
          console.error("Error creating proxy:", error)
          let errorMessage = "Có lỗi xảy ra khi tạo proxy"
          
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

  if (isLoading) {
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
        data={proxies}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleViewDetail}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm proxy..."
        searchKey="name"
      />

      <EntityForm
        title={editingProxy ? "Chỉnh sửa Proxy" : "Thêm Proxy mới"}
        description={editingProxy ? "Cập nhật thông tin proxy" : "Thêm proxy mới vào hệ thống"}
        fields={formFields}
        initialData={editingProxy || {}}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />

      <ProxyDetailModal
        proxyId={selectedProxyId}
        isOpen={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) {
            setSelectedProxyId(null)
          }
        }}
        onEdit={handleEdit}
      />
    </div>
  )
}

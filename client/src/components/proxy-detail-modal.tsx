import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { Pencil } from "lucide-react"
import { useProxy } from "@/hooks/useProxies"
import type { Proxy } from "@shared/schema"

interface ProxyDetailModalProps {
  proxyId: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (proxy: Proxy) => void
}

export function ProxyDetailModal({ proxyId, isOpen, onOpenChange, onEdit }: ProxyDetailModalProps) {
  const { data: proxy, isLoading, error, refetch } = useProxy(proxyId || "")

  // Reset data and refetch when modal is opened
  useEffect(() => {
    if (isOpen && proxyId) {
      // Force refetch every time the modal opens
      refetch()
    }
  }, [isOpen, proxyId, refetch])

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết Proxy</DialogTitle>
        </DialogHeader>
        
        {isLoading && (
          <div className="py-4 text-center">Đang tải thông tin...</div>
        )}
        
        {error && (
          <div className="py-4 text-center text-red-500">
            Có lỗi xảy ra khi tải thông tin proxy
          </div>
        )}
        
        {proxy && !isLoading && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">ID</span>
              <span className="col-span-3 text-sm">{proxy.id}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Tên</span>
              <span className="col-span-3 text-sm">{proxy.name}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Mô tả</span>
              <span className="col-span-3 text-sm">{proxy.description || "N/A"}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Giá</span>
              <span className="col-span-3 text-sm">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(proxy.price || 0)}
              </span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Tồn kho</span>
              <span className="col-span-3 text-sm">{proxy.inventory || 0}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Đã bán</span>
              <span className="col-span-3 text-sm">{proxy.soldQuantity || 0}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Lượt xem</span>
              <span className="col-span-3 text-sm">{proxy.viewCount || 0}</span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Trạng thái</span>
              <div className="col-span-3">
                {(() => {
                  const statusMap: Record<number, string> = {
                    0: "inactive",
                    1: "active"
                  };
                  return <StatusBadge status={statusMap[proxy.status] || "unknown"} />
                })()}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Ngày tạo</span>
              <span className="col-span-3 text-sm">
                {proxy.createdAt 
                  ? new Date(proxy.createdAt).toLocaleDateString('vi-VN')
                  : "N/A"}
              </span>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Cập nhật</span>
              <span className="col-span-3 text-sm">
                {proxy.updatedAt 
                  ? new Date(proxy.updatedAt).toLocaleDateString('vi-VN')
                  : "N/A"}
              </span>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button 
                onClick={() => {
                  if (onEdit) {
                    onEdit(proxy)
                    onOpenChange(false)
                  }
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

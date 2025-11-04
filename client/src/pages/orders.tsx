import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import { OrderSetupModal } from "@/components/order-setup-modal"
import { useOrders } from "@/hooks/useOrders"
import type { Order } from "@shared/schema"

export default function OrdersPage() {
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [setupOrder, setSetupOrder] = useState<Order | null>(null)
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false)
  const itemsPerPage = 10
  
  const { data, isLoading, error, isFetching, refetch } = useOrders(
    { 
      keyword: searchKeyword || undefined, 
      page: currentPage, 
      limit: itemsPerPage 
    }
  )
  
  const orderList = data?.items || []
  const meta = data?.meta || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1
  }
  
  const columns = [
    { 
      header: "Mã đơn hàng", 
      accessor: (order: Order) => order.code
    },
    { 
      header: "Khách hàng", 
      accessor: (order: Order) => (
        <div>
          <div>{order.user.fullname}</div>
          <div className="text-sm text-gray-500">{order.user.email}</div>
        </div>
      )
    },
    { 
      header: "Loại", 
      accessor: (order: Order) => (
        <Badge variant={
          order.type === "proxy" ? "default" : 
          order.type === "tool" ? "secondary" : 
          "outline"
        }>
          {order.type === "proxy" ? "Proxy" : 
           order.type === "tool" ? "Tool" : 
           order.type === "vps" ? "VPS" : order.type}
        </Badge>
      )
    },
    { 
      header: "Sản phẩm", 
      accessor: (order: Order) => {
        if (order.type === "proxy" && order.proxy) {
          return order.proxy.name;
        } else if (order.type === "tool" && order.tool) {
          return order.tool.name;
        } else if (order.type === "vps" && order.vps) {
          return order.vps.name;
        }
        return "N/A";
      }
    },
    { 
      header: "Ngày tạo", 
      accessor: (order: Order) => new Date(order.createdAt).toLocaleDateString("vi-VN")
    },
    { 
      header: "Ngày hết hạn", 
      accessor: (order: Order) => {
        // Show expiration date based on order type
        if (order.type === "tool" && order.toolOrder?.expiredAt) {
          return new Date(order.toolOrder.expiredAt).toLocaleDateString("vi-VN");
        } else if (order.type === "proxy" && order.proxyOrder?.expiredAt) {
          return new Date(order.proxyOrder.expiredAt).toLocaleDateString("vi-VN");
        } else if (order.type === "vps" && order.vpsOrder?.expiredAt) {
          return new Date(order.vpsOrder.expiredAt).toLocaleDateString("vi-VN");
        } else if (order.expiredAt) {
          // Fallback for older data structure
          return new Date(order.expiredAt).toLocaleDateString("vi-VN");
        }
        return "N/A";
      }
    },
    { 
      header: "Trạng thái", 
      accessor: (order: Order) => (
        <Badge variant={
          order.status === "setup" ? "default" : 
          order.status === "active" ? "secondary" : 
          "destructive"
        }>
          {order.status === "setup" ? "Đang cài đặt" : 
           order.status === "active" ? "Hoạt động" : 
           order.status === "cancelled" ? "Đã hủy" : order.status}
        </Badge>
      )
    },
    { 
      header: "Tổng tiền", 
      accessor: (order: Order) => {
        // Format price as VND currency
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(order.totalPrice);
      }
    },
    { 
      header: "Hành động", 
      accessor: (order: Order) => {
        // Only show setup button for VPS and Proxy orders with "setup" status
        if ((order.type === "vps" || order.type === "proxy") && order.status === "setup") {
          return (
            <Button 
              size="sm" 
              onClick={() => {
                setSetupOrder(order);
                setIsSetupModalOpen(true);
              }}
            >
              Setup
            </Button>
          );
        }
        return null;
      }
    }
  ]

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    // Reset to first page when searching
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSetupSuccess = () => {
    // Refetch the order list after successful setup
    refetch();
  }

  // Show loading indicator only on initial load, not during subsequent searches or pagination
  const showLoading = isLoading && !searchKeyword && currentPage === 1

  if (showLoading) {
    return <div>Đang tải dữ liệu...</div>
  }

  if (error) {
    console.error("Orders Page Error:", error);
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
      <DataTable<Order>
        title="Quản lý Đơn hàng"
        data={orderList}
        columns={columns}
        searchPlaceholder="Tìm kiếm đơn hàng..."
        searchKey="code"
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
      
      <OrderSetupModal
        order={setupOrder}
        open={isSetupModalOpen}
        onOpenChange={setIsSetupModalOpen}
        onSetupSuccess={handleSetupSuccess}
      />
    </div>
  )
}

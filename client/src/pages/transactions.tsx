import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { useTransactions } from "@/hooks/useTransactions";
import type { Transaction } from "@shared/schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data, isLoading, error, isFetching, refetch } = useTransactions({
    keyword: searchKeyword || undefined,
    page: currentPage,
    limit: itemsPerPage
  });
  
  const transactionList = data?.items || [];
  const meta = data?.meta || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 1
  };

  // Memoize columns to prevent re-creation on each render
  const columns = useMemo(() => [
    { header: "ID", accessor: "id" },
    { header: "Mã giao dịch", accessor: "code" },
    { 
      header: "Người dùng", 
      accessor: (transaction: Transaction) => transaction.user?.fullname || "Không xác định"
    },
    { 
      header: "Email", 
      accessor: (transaction: Transaction) => transaction.user?.email || "Không xác định"
    },
    { 
      header: "Số tiền", 
      accessor: (transaction: Transaction) => {
        if (typeof transaction.amount !== 'number') return "Không xác định";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(transaction.amount);
      }
    },
    { 
      header: "Hành động", 
      accessor: (transaction: Transaction) => {
        const action = transaction.action || "unknown";
        let actionText = "Không xác định";
        let actionClass = "bg-gray-100 text-gray-800";
        
        if (action === "deposit") {
          actionText = "Nạp tiền";
          actionClass = "bg-green-100 text-green-800";
        } else if (action === "withdraw") {
          actionText = "Rút tiền";
          actionClass = "bg-red-100 text-red-800";
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionClass}`}>
            {actionText}
          </span>
        );
      }
    },
    { header: "Ghi chú", accessor: "note" },
    { 
      header: "Ngày tạo", 
      accessor: (transaction: Transaction) => {
        if (!transaction.createdAt) return "Không xác định";
        try {
          return format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: vi });
        } catch (e) {
          return "Không xác định";
        }
      }
    }
  ], []);

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
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Đang tải dữ liệu giao dịch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Transactions error:", error);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu giao dịch</p>
          <p className="text-sm text-muted-foreground mt-2">
            {(error as any).message || "Vui lòng thử lại sau"}
          </p>
        </div>
      </div>
    );
  }

  // Handle case where transactions data might be malformed
  if (!Array.isArray(transactionList)) {
    console.error("Transactions data is not an array:", transactionList);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">Dữ liệu giao dịch không hợp lệ</p>
          <p className="text-sm text-muted-foreground mt-2">
            Không thể hiển thị danh sách giao dịch do lỗi dữ liệu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Danh sách giao dịch"
        data={transactionList}
        columns={columns}
        searchPlaceholder="Tìm kiếm giao dịch..."
        searchKey="id"
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
    </div>
  );
}

// Simple pagination component for transactions page
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

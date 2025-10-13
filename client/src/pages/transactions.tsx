import { useState, useMemo, startTransition, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { useTransactions } from "@/hooks/useTransactions";
import type { Transaction } from "@shared/schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function TransactionsPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { data: transactions = [], isLoading, error } = useTransactions(searchKeyword);

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
    startTransition(() => {
      setSearchKeyword(keyword);
    });
  };

  if (isLoading && !searchKeyword) {
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
  if (!Array.isArray(transactions)) {
    console.error("Transactions data is not an array:", transactions);
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
        data={transactions}
        columns={columns}
        searchPlaceholder="Tìm kiếm giao dịch..."
        searchKey="id"
        onSearch={handleSearch}
      />
    </div>
  );
}

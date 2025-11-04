import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  // Ensure all values are valid numbers
  const validCurrentPage = Math.max(1, currentPage) || 1;
  const validTotalPages = Math.max(1, totalPages) || 1;
  const validTotalItems = Math.max(0, totalItems) || 0;
  const validItemsPerPage = Math.max(1, itemsPerPage) || 10;
  
  const startIndex = (validCurrentPage - 1) * validItemsPerPage + 1;
  const endIndex = Math.min(validCurrentPage * validItemsPerPage, validTotalItems);
  
  const handleFirstPage = () => onPageChange(1);
  const handlePreviousPage = () => onPageChange(Math.max(1, validCurrentPage - 1));
  const handleNextPage = () => onPageChange(Math.min(validTotalPages, validCurrentPage + 1));
  const handleLastPage = () => onPageChange(validTotalPages);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị từ {startIndex} đến {endIndex} trong tổng số {validTotalItems} kết quả
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={validCurrentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={validCurrentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          Trang {validCurrentPage} / {validTotalPages}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={validCurrentPage === validTotalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={validCurrentPage === validTotalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  searchPlaceholder?: string
  searchKey?: keyof T
  onSearch?: (keyword: string) => void
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  searchPlaceholder = "Tìm kiếm...",
  searchKey,
  onSearch
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [deleteItem, setDeleteItem] = useState<T | null>(null)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // If onSearch is provided, let the parent component handle the search
    // Otherwise, do client-side filtering
    if (onSearch) {
      onSearch(value)
    }
  }

  // If onSearch is provided, show all data (server-side filtering)
  // Otherwise, filter data locally (client-side filtering)
  const filteredData = search && searchKey && !onSearch
    ? data.filter(item => 
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data

  const handleDelete = (item: T) => {
    setDeleteItem(item)
  }

  const confirmDelete = () => {
    if (deleteItem && onDelete) {
      console.log(`Deleting item:`, deleteItem)
      onDelete(deleteItem)
      setDeleteItem(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight" data-testid={`title-${title.toLowerCase()}`}>{title}</h2>
        {onAdd && (
          <Button onClick={onAdd} data-testid="button-add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        )}
      </div>

      {searchKey && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-right">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} 
                  className="h-24 text-center"
                  data-testid="empty-state"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={item.id} data-testid={`row-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {typeof column.accessor === "function"
                        ? column.accessor(item)
                        : String(item[column.accessor] || "")
                      }
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right space-x-2">
                      {onEdit && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            console.log(`Editing item:`, item)
                            onEdit(item)
                          }}
                          data-testid={`button-edit-${index}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(item)}
                          data-testid={`button-delete-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

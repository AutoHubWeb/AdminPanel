import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { EntityForm } from "@/components/entity-form"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import type { Proxy } from "@shared/schema"

export default function ProxiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)

  // todo: remove mock data
  const mockProxies: Proxy[] = [
    {
      id: "1",
      name: "Proxy-US-01",
      host: "proxy1.example.com",
      port: 8080,
      type: "http",
      location: "USA",
      status: "online",
      username: "user1",
      isAnonymous: true
    },
    {
      id: "2",
      name: "Proxy-SG-01",
      host: "proxy2.example.com", 
      port: 3128,
      type: "https",
      location: "Singapore",
      status: "online",
      username: "user2",
      isAnonymous: false
    },
    {
      id: "3",
      name: "Proxy-EU-01",
      host: "proxy3.example.com",
      port: 1080,
      type: "socks5",
      location: "Germany",
      status: "offline",
      username: null,
      isAnonymous: true
    }
  ]

  const columns = [
    { header: "Tên Proxy", accessor: "name" as keyof Proxy },
    { 
      header: "Địa chỉ",
      accessor: (proxy: Proxy) => (
        <div className="font-mono text-sm">
          {proxy.host}:{proxy.port}
        </div>
      )
    },
    { 
      header: "Loại", 
      accessor: (proxy: Proxy) => (
        <Badge variant="outline" className="uppercase">{proxy.type}</Badge>
      )
    },
    { 
      header: "Vị trí", 
      accessor: (proxy: Proxy) => (
        <Badge variant="outline">{proxy.location}</Badge>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: (proxy: Proxy) => <StatusBadge status={proxy.status} />
    },
    { 
      header: "Ẩn danh",
      accessor: (proxy: Proxy) => (
        <div className="flex items-center">
          {proxy.isAnonymous ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
      )
    },
    { 
      header: "Username",
      accessor: (proxy: Proxy) => proxy.username || (
        <span className="text-muted-foreground">Không có</span>
      )
    }
  ]

  const formFields = [
    { name: "name", label: "Tên Proxy", type: "text" as const, required: true },
    { name: "host", label: "Host", type: "text" as const, required: true },
    { name: "port", label: "Port", type: "number" as const, required: true },
    { 
      name: "type", 
      label: "Loại Proxy", 
      type: "select" as const,
      options: [
        { value: "http", label: "HTTP" },
        { value: "https", label: "HTTPS" },
        { value: "socks4", label: "SOCKS4" },
        { value: "socks5", label: "SOCKS5" }
      ]
    },
    { 
      name: "location", 
      label: "Vị trí", 
      type: "select" as const,
      options: [
        { value: "USA", label: "USA" },
        { value: "Singapore", label: "Singapore" },
        { value: "Germany", label: "Germany" },
        { value: "Japan", label: "Japan" },
        { value: "Vietnam", label: "Vietnam" }
      ]
    },
    {
      name: "status",
      label: "Trạng thái", 
      type: "select" as const,
      options: [
        { value: "online", label: "Online" },
        { value: "offline", label: "Offline" }
      ]
    },
    { name: "username", label: "Username", type: "text" as const },
    {
      name: "isAnonymous",
      label: "Ẩn danh",
      type: "select" as const,
      options: [
        { value: "true", label: "Có" },
        { value: "false", label: "Không" }
      ]
    }
  ]

  const handleAdd = () => {
    setEditingProxy(null)
    setIsFormOpen(true)
  }

  const handleEdit = (proxy: Proxy) => {
    setEditingProxy({
      ...proxy,
      isAnonymous: proxy.isAnonymous ? "true" : "false"
    } as any)
    setIsFormOpen(true)
  }

  const handleDelete = (proxy: Proxy) => {
    console.log("Deleting proxy:", proxy)
  }

  const handleSubmit = (data: Record<string, any>) => {
    const submitData = {
      ...data,
      port: parseInt(data.port),
      isAnonymous: data.isAnonymous === "true"
    }
    
    if (editingProxy) {
      console.log("Updating proxy:", editingProxy.id, submitData)
    } else {
      console.log("Creating proxy:", submitData)
    }
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý Proxy"
        data={mockProxies}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
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
    </div>
  )
}
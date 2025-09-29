import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { EntityForm } from "@/components/entity-form"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import type { Vps } from "@shared/schema"

export default function VpsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVps, setEditingVps] = useState<Vps | null>(null)

  // todo: remove mock data
  const mockVps: Vps[] = [
    {
      id: "1",
      name: "VPS-SG-01",
      ipAddress: "192.168.1.100",
      location: "Singapore",
      provider: "DigitalOcean",
      status: "online",
      cpu: 4,
      ram: 8,
      storage: 160,
      bandwidth: 1000
    },
    {
      id: "2",
      name: "VPS-US-01", 
      ipAddress: "10.0.0.50",
      location: "USA",
      provider: "AWS",
      status: "online",
      cpu: 2,
      ram: 4,
      storage: 80,
      bandwidth: 500
    },
    {
      id: "3",
      name: "VPS-EU-01",
      ipAddress: "172.16.0.10",
      location: "Germany",
      provider: "Vultr",
      status: "offline",
      cpu: 8,
      ram: 16,
      storage: 320,
      bandwidth: 2000
    }
  ]

  const columns = [
    { header: "Tên VPS", accessor: "name" as keyof Vps },
    { header: "IP Address", accessor: "ipAddress" as keyof Vps, className: "font-mono" },
    { 
      header: "Vị trí", 
      accessor: (vps: Vps) => (
        <Badge variant="outline">{vps.location}</Badge>
      )
    },
    { header: "Provider", accessor: "provider" as keyof Vps },
    { 
      header: "Trạng thái", 
      accessor: (vps: Vps) => <StatusBadge status={vps.status} />
    },
    { 
      header: "Cấu hình",
      accessor: (vps: Vps) => (
        <div className="text-sm">
          <div>CPU: {vps.cpu} cores</div>
          <div>RAM: {vps.ram} GB</div>
          <div>Storage: {vps.storage} GB</div>
        </div>
      )
    },
    { 
      header: "Bandwidth",
      accessor: (vps: Vps) => `${vps.bandwidth} GB/tháng`
    }
  ]

  const formFields = [
    { name: "name", label: "Tên VPS", type: "text" as const, required: true },
    { name: "ipAddress", label: "IP Address", type: "text" as const, required: true },
    { 
      name: "location", 
      label: "Vị trí", 
      type: "select" as const,
      options: [
        { value: "Singapore", label: "Singapore" },
        { value: "USA", label: "USA" },
        { value: "Germany", label: "Germany" },
        { value: "Japan", label: "Japan" },
        { value: "Vietnam", label: "Vietnam" }
      ]
    },
    { 
      name: "provider", 
      label: "Provider", 
      type: "select" as const,
      options: [
        { value: "DigitalOcean", label: "DigitalOcean" },
        { value: "AWS", label: "AWS" },
        { value: "Vultr", label: "Vultr" },
        { value: "Linode", label: "Linode" },
        { value: "Google Cloud", label: "Google Cloud" }
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
    { name: "cpu", label: "CPU (cores)", type: "number" as const, required: true },
    { name: "ram", label: "RAM (GB)", type: "number" as const, required: true },
    { name: "storage", label: "Storage (GB)", type: "number" as const, required: true },
    { name: "bandwidth", label: "Bandwidth (GB/tháng)", type: "number" as const, required: true }
  ]

  const handleAdd = () => {
    setEditingVps(null)
    setIsFormOpen(true)
  }

  const handleEdit = (vps: Vps) => {
    setEditingVps(vps)
    setIsFormOpen(true)
  }

  const handleDelete = (vps: Vps) => {
    console.log("Deleting VPS:", vps)
  }

  const handleSubmit = (data: Record<string, any>) => {
    if (editingVps) {
      console.log("Updating VPS:", editingVps.id, data)
    } else {
      console.log("Creating VPS:", data)
    }
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý VPS"
        data={mockVps}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm VPS..."
        searchKey="name"
      />

      <EntityForm
        title={editingVps ? "Chỉnh sửa VPS" : "Thêm VPS mới"}
        description={editingVps ? "Cập nhật thông tin VPS" : "Thêm VPS mới vào hệ thống"}
        fields={formFields}
        initialData={editingVps || {}}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
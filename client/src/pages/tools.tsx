import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { EntityForm } from "@/components/entity-form"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, TrendingUp, DollarSign } from "lucide-react"
import type { Tool } from "@shared/schema"

export default function ToolsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)

  // Mock data theo API response mới
  const mockToolsWithPlans = [
    {
      id: "68d81c76f9629f25fdf47fd0",
      code: "ABCD124",
      name: "Tool treo up sức mạnh 1tr5",
      description: "Tool cực vip",
      demo: "https://www.facebook.com/dngiang2003",
      slug: "ABCD124-tool-treo-up-suc-manh-1tr5",
      soldQuantity: 0,
      viewCount: 6,
      status: 0,
      createdAt: new Date("2025-09-27T17:18:46.222Z"),
      updatedAt: new Date("2025-09-29T03:40:59.216Z"),
      images: [
        {
          id: "68da9b302bf3ce8bf96bfcd6",
          fileUrl: "/static/tool/50ZCdU9aOJKC.jpg"
        }
      ],
      plans: [
        {
          name: "1 Tháng",
          price: 10000,
          duration: 1
        },
        {
          name: "3 Tháng", 
          price: 25000,
          duration: 3
        },
        {
          name: "Vĩnh viễn",
          price: 60000,
          duration: -1
        }
      ]
    },
    {
      id: "68d81c76f9629f25fdf47fd1",
      code: "TOOL001",
      name: "Auto Like Facebook Pro",
      description: "Tool tự động like bài viết Facebook chuyên nghiệp",
      demo: "https://example.com/demo",
      slug: "TOOL001-auto-like-facebook-pro",
      soldQuantity: 15,
      viewCount: 234,
      status: 1,
      createdAt: new Date("2025-09-25T10:30:00.000Z"),
      updatedAt: new Date("2025-09-28T15:45:00.000Z"),
      images: [
        {
          id: "img001",
          fileUrl: "/static/tool/facebook_tool.jpg"
        }
      ],
      plans: [
        {
          name: "1 Tuần",
          price: 5000,
          duration: 0.25
        },
        {
          name: "1 Tháng",
          price: 15000,
          duration: 1
        },
        {
          name: "6 Tháng",
          price: 80000,
          duration: 6
        }
      ]
    },
    {
      id: "68d81c76f9629f25fdf47fd2",
      code: "TOOL002",
      name: "Instagram Auto Follower",
      description: "Tool tăng follower Instagram tự động",
      demo: null,
      slug: "TOOL002-instagram-auto-follower", 
      soldQuantity: 8,
      viewCount: 156,
      status: 1,
      createdAt: new Date("2025-09-20T08:15:00.000Z"),
      updatedAt: new Date("2025-09-28T12:30:00.000Z"),
      images: [],
      plans: [
        {
          name: "3 Ngày",
          price: 3000,
          duration: 0.1
        },
        {
          name: "1 Tháng",
          price: 12000,
          duration: 1
        },
        {
          name: "3 Tháng",
          price: 30000,
          duration: 3
        }
      ]
    }
  ]

  // Convert to match existing Tool type for display
  const mockTools = mockToolsWithPlans.map(tool => ({
    id: tool.id,
    code: tool.code,
    name: tool.name,
    description: tool.description,
    demo: tool.demo,
    slug: tool.slug,
    soldQuantity: tool.soldQuantity,
    viewCount: tool.viewCount,
    status: tool.status,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt
  }))

  const columns = [
    { 
      header: "Mã Tool", 
      accessor: "code" as keyof Tool,
      className: "font-mono font-semibold"
    },
    { 
      header: "Tên Tool", 
      accessor: "name" as keyof Tool,
      className: "font-medium"
    },
    { header: "Mô tả", accessor: "description" as keyof Tool },
    { 
      header: "Gói giá", 
      accessor: (tool: Tool) => {
        const toolWithPlans = mockToolsWithPlans.find(t => t.id === tool.id)
        if (!toolWithPlans?.plans?.length) {
          return <span className="text-muted-foreground">Chưa có gói</span>
        }
        
        return (
          <div className="space-y-1">
            {toolWithPlans.plans.slice(0, 2).map((plan, index) => (
              <div key={index} className="flex items-center gap-1 text-sm">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="font-medium">{plan.price.toLocaleString('vi-VN')}đ</span>
                <span className="text-muted-foreground">- {plan.name}</span>
              </div>
            ))}
            {toolWithPlans.plans.length > 2 && (
              <span className="text-xs text-muted-foreground">+{toolWithPlans.plans.length - 2} gói khác</span>
            )}
          </div>
        )
      }
    },
    { 
      header: "Thống kê", 
      accessor: (tool: Tool) => (
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
      accessor: (tool: Tool) => (
        <Badge variant={tool.status === 1 ? "default" : "secondary"}>
          {tool.status === 1 ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      )
    },
    { 
      header: "Demo",
      accessor: (tool: Tool) => tool.demo ? (
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
      accessor: (tool: Tool) => new Date(tool.createdAt).toLocaleDateString('vi-VN')
    }
  ]

  const formFields = [
    { name: "code", label: "Mã Tool", type: "text" as const, required: true },
    { name: "name", label: "Tên Tool", type: "text" as const, required: true },
    { name: "description", label: "Mô tả", type: "textarea" as const },
    { name: "demo", label: "Link Demo", type: "text" as const },
    {
      name: "status",
      label: "Trạng thái", 
      type: "select" as const,
      options: [
        { value: "1", label: "Hoạt động" },
        { value: "0", label: "Không hoạt động" }
      ]
    }
  ]

  const handleAdd = () => {
    setEditingTool(null)
    setIsFormOpen(true)
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setIsFormOpen(true)
  }

  const handleDelete = (tool: Tool) => {
    console.log("Deleting tool:", tool)
  }

  const handleSubmit = (data: Record<string, any>) => {
    if (editingTool) {
      console.log("Updating tool:", editingTool.id, data)
    } else {
      console.log("Creating tool:", data)
    }
  }

  return (
    <div className="space-y-6">
      <DataTable
        title="Quản lý Tool"
        data={mockTools}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm tool..."
        searchKey="name"
      />

      <EntityForm
        title={editingTool ? "Chỉnh sửa Tool" : "Thêm Tool mới"}
        description={editingTool ? "Cập nhật thông tin tool" : "Thêm tool mới vào hệ thống"}
        fields={formFields}
        initialData={editingTool || {}}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
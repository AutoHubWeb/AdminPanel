import { DataTable } from '../data-table'

export default function DataTableExample() {
  const mockData = [
    { id: "1", name: "Item 1", status: "active", category: "test" },
    { id: "2", name: "Item 2", status: "inactive", category: "demo" },
  ]

  const columns = [
    { header: "Name", accessor: "name" as const },
    { header: "Status", accessor: "status" as const },
    { header: "Category", accessor: "category" as const }
  ]

  return (
    <DataTable
      title="Example Table"
      data={mockData}
      columns={columns}
      onAdd={() => console.log("Add clicked")}
      onEdit={(item) => console.log("Edit:", item)}
      onDelete={(item) => console.log("Delete:", item)}
      searchKey="name"
    />
  )
}
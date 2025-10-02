import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Trash2, Upload } from "lucide-react"
import { fileApi } from "@/lib/api"

interface Plan {
  name: string
  price: number | string
  duration: number | string
}

interface FileUploadResponse {
  statusCode: number
  data: {
    id: string
    fileUrl: string
  }
  message: string
}

interface UploadedImage {
  id: string
  fileUrl: string
  fileName: string
}

interface ToolFormProps {
  title: string
  description?: string
  initialData?: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void> | void
  isLoading?: boolean
}

export function ToolForm({
  title,
  description,
  initialData = {},
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false
}: ToolFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    demo: "",
    linkDownload: "",
    status: "1",
    images: [] as UploadedImage[], // Store uploaded images with IDs and URLs
    plans: [] as Plan[],
    ...initialData
  })

  // Update form data when initialData changes
  useEffect(() => {
    // Transform initial images data if needed
    const initialImages = initialData.images ? initialData.images.map((img: any) => ({
      id: img.id || img,
      fileUrl: img.fileUrl || '',
      fileName: img.fileName || 'Existing image'
    })) : [];
    
    setFormData({
      code: initialData.code || "",
      name: initialData.name || "",
      description: initialData.description || "",
      demo: initialData.demo || "",
      linkDownload: initialData.linkDownload || "",
      status: initialData.status?.toString() || "1",
      images: initialImages,
      plans: initialData.plans || [],
      ...initialData
    })
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Transform data to match API requirements
    const toolData = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      demo: formData.demo,
      linkDownload: formData.linkDownload,
      status: parseInt(formData.status),
      images: formData.images.map((img: { id: string; fileUrl: string; fileName: string }) => img.id), // Send file IDs
      plans: formData.plans.map((plan: Plan) => ({
        name: plan.name,
        price: parseInt(plan.price as string) || 0,
        duration: parseInt(plan.duration as string) || 0
      }))
    }
    
    console.log("Submitting tool data:", toolData)
    await onSubmit(toolData)
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }))
  }

  const handlePlanChange = (index: number, field: keyof Plan, value: string) => {
    setFormData((prev: typeof formData) => {
      const newPlans = [...prev.plans]
      newPlans[index] = { ...newPlans[index], [field]: value }
      return { ...prev, plans: newPlans }
    })
  }

  const addPlan = () => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      plans: [...prev.plans, { name: "", price: "", duration: "" }]
    }))
  }

  const removePlan = (index: number) => {
    setFormData((prev: typeof formData) => {
      const newPlans = [...prev.plans]
      newPlans.splice(index, 1)
      return { ...prev, plans: newPlans }
    })
  }

  const addImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      
      // Upload each file immediately
      for (const file of files) {
        try {
          const formDataObj = new FormData()
          formDataObj.append("file", file)
          
          const response = await fileApi.uploadSingle(formDataObj)
          const fileResponse = response.data as FileUploadResponse
          
          if (fileResponse.statusCode === 201) {
            // Add uploaded image to the form data
            setFormData((prev: typeof formData) => ({
              ...prev,
              images: [
                ...prev.images,
                {
                  id: fileResponse.data.id,
                  fileUrl: fileResponse.data.fileUrl,
                  fileName: file.name
                }
              ]
            }))
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError)
          // You might want to show an error message to the user here
        }
      }
    }
    
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev: typeof formData) => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      return { ...prev, images: newImages }
    })
  }

  const handleImageChange = (index: number, value: string) => {
    setFormData((prev: typeof formData) => {
      const newImages = [...prev.images]
      newImages[index] = { ...newImages[index], fileUrl: value }
      return { ...prev, images: newImages }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="tool-dialog-form">
        <DialogHeader>
          <DialogTitle data-testid="tool-form-title">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Fields */}
            <div className="grid gap-2">
              <Label htmlFor="code">
                Mã Tool <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                required
                data-testid="input-code"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên Tool <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                data-testid="input-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                data-testid="textarea-description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="demo">Link Demo</Label>
              <Input
                id="demo"
                value={formData.demo}
                onChange={(e) => handleInputChange("demo", e.target.value)}
                data-testid="input-demo"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="linkDownload">Link Download</Label>
              <Input
                id="linkDownload"
                value={formData.linkDownload}
                onChange={(e) => handleInputChange("linkDownload", e.target.value)}
                data-testid="input-linkDownload"
              />
            </div>

            {/* Images */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                  data-testid="button-add-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn ảnh
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
              
              {/* Display uploaded images */}
              {formData.images.map((image: UploadedImage, index: number) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={image.fileUrl}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Image URL"
                    data-testid={`input-image-${index}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImage(index)}
                    data-testid={`button-remove-image-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {formData.images.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có images</p>
              )}
            </div>

            {/* Plans */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Gói giá</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPlan}
                  data-testid="button-add-plan"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.plans.map((plan: Plan, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-md">
                  <div className="col-span-4">
                    <Input
                      value={plan.name}
                      onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                      placeholder="Tên gói"
                      data-testid={`input-plan-name-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handlePlanChange(index, "price", e.target.value)}
                      placeholder="Giá"
                      data-testid={`input-plan-price-${index}`}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      value={plan.duration}
                      onChange={(e) => handlePlanChange(index, "duration", e.target.value)}
                      placeholder="Thời hạn"
                      data-testid={`input-plan-duration-${index}`}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePlan(index)}
                      data-testid={`button-remove-plan-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {formData.plans.length === 0 && (
                <p className="text-sm text-muted-foreground">Chưa có gói giá</p>
              )}
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoạt động</SelectItem>
                  <SelectItem value="0">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              data-testid="button-cancel"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              data-testid="button-submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

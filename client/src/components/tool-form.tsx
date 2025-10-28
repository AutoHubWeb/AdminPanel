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
import { Plus, Trash2, Upload, Image, Package, Info } from "lucide-react"
import { fileApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Plan {
  name: string
  price: number | string
  duration: number | string
}

interface FileUploadResponse {
  status: number
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
    // If we're loading detail data, don't update form data yet
    if (isLoading) return;
    
    // Transform initial images data if needed
    const initialImages = initialData.images ? initialData.images.map((img: any) => ({
      id: img.id || img,
      fileUrl: img.fileUrl || '', // This should already be a full URL from the API
      fileName: img.fileName || img.originalName || 'Existing image'
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
  }, [initialData, isOpen, isLoading])

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
      imageIds: formData.images.map((img: { id: string; fileUrl: string; fileName: string }) => img.id), // Send file IDs in imageIds field
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
          const fileResponse = response as unknown as FileUploadResponse
          
          console.log("File upload response:", fileResponse);
          
          if (fileResponse.status === 201) {
            // Add uploaded image to the form data using the full URL from the API response
            setFormData((prev: typeof formData) => ({
              ...prev,
              images: [
                ...prev.images,
                {
                  id: fileResponse.data.id,
                  fileUrl: fileResponse.data.fileUrl, // Use the full URL directly from API
                  fileName: file.name
                }
              ]
            }))
            
            // Log the updated state
            console.log("Added image to form data:", fileResponse.data);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="tool-dialog-form">
        <DialogHeader>
          <DialogTitle data-testid="tool-form-title" className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Đang tải thông tin tool...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">
                        Mã Tool <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => handleInputChange("code", e.target.value)}
                        required
                        data-testid="input-code"
                        placeholder="Nhập mã tool"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tên Tool <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        data-testid="input-name"
                        placeholder="Nhập tên tool"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      data-testid="textarea-description"
                      placeholder="Nhập mô tả tool"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Links Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Liên kết
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo">Link Demo</Label>
                    <Input
                      id="demo"
                      value={formData.demo}
                      onChange={(e) => handleInputChange("demo", e.target.value)}
                      data-testid="input-demo"
                      placeholder="https://example.com/demo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkDownload">Link Download</Label>
                    <Input
                      id="linkDownload"
                      value={formData.linkDownload}
                      onChange={(e) => handleInputChange("linkDownload", e.target.value)}
                      data-testid="input-linkDownload"
                      placeholder="https://example.com/download"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="w-5 h-5 text-primary" />
                    Hình ảnh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {formData.images.length > 0 
                        ? `${formData.images.length} hình ảnh đã tải lên` 
                        : "Chưa có hình ảnh"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addImage}
                      data-testid="button-add-image"
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
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
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images.map((image: UploadedImage, index: number) => (
                        <div key={`${image.id}-${index}`} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden border bg-muted">
                            <img 
                              src={image.fileUrl.startsWith('http') ? image.fileUrl : `https://shopnro.hitly.click/api/v1/files${image.fileUrl}`}
                              alt={`Preview ${index}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Handle image load errors
                                const target = e.target as HTMLImageElement;
                                console.error("Error loading image:", target.src);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                            data-testid={`button-remove-image-${index}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plans Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Gói giá
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {formData.plans.length > 0 
                        ? `${formData.plans.length} gói giá đã tạo` 
                        : "Chưa có gói giá"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPlan}
                      data-testid="button-add-plan"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm gói
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.plans.map((plan: Plan, index: number) => (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg bg-muted/50">
                        <div className="col-span-5 space-y-2">
                          <Label className="text-xs">Tên gói</Label>
                          <Input
                            value={plan.name}
                            onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                            placeholder="Tên gói"
                            data-testid={`input-plan-name-${index}`}
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label className="text-xs">Giá (VNĐ)</Label>
                          <Input
                            type="number"
                            value={plan.price}
                            onChange={(e) => handlePlanChange(index, "price", e.target.value)}
                            placeholder="Giá"
                            data-testid={`input-plan-price-${index}`}
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label className="text-xs">Thời hạn (ngày)</Label>
                          <Input
                            type="number"
                            value={plan.duration}
                            onChange={(e) => handlePlanChange(index, "duration", e.target.value)}
                            placeholder="Thời hạn"
                            data-testid={`input-plan-duration-${index}`}
                          />
                        </div>
                        <div className="col-span-1 flex items-end pb-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePlan(index)}
                            data-testid={`button-remove-plan-${index}`}
                            className="h-9 w-9"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Hoạt động</SelectItem>
                        <SelectItem value="0">Không hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="gap-2 sm:space-x-0">
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
                className="min-w-[100px]"
              >
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

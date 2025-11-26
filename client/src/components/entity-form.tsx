import { useState, useEffect } from "react"
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

interface FormField {
  name: string
  label: string
  type: "text" | "email" | "number" | "textarea" | "select"
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
}

interface EntityFormProps {
  title: string
  description?: string
  fields: FormField[]
  initialData?: Record<string, any>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, any>) => Promise<void> | void
  isLoading?: boolean
}

export function EntityForm({
  title,
  description,
  fields,
  initialData = {},
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false
}: EntityFormProps) {
  const [formData, setFormData] = useState(initialData)

  // Update form data when initialData changes (e.g. when editing a different item)
  useEffect(() => {
    setFormData(initialData)
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      // Only close form if submission was successful
      // The parent component will handle closing via onOpenChange
    } catch (error) {
      console.error("Form submission error:", error)
      // Keep form open on error so user can retry
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-form">
        <DialogHeader>
          <DialogTitle data-testid="form-title">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === "select" ? (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(value) => handleInputChange(field.name, value)}
                  >
                    <SelectTrigger data-testid={`select-${field.name}`}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    data-testid={`textarea-${field.name}`}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === "text" && field.name === "password" ? "password" : field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    data-testid={`input-${field.name}`}
                  />
                )}
              </div>
            ))}
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

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
}

export function FileUpload({ 
  onFileSelect, 
  multiple = false, 
  accept = "*", 
  maxFiles = 5 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Limit the number of files
      if (files.length > maxFiles) {
        alert(`Bạn chỉ có thể chọn tối đa ${maxFiles} tệp.`);
        return;
      }
      
      setSelectedFiles(files);
      onFileSelect(files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Chọn tệp
      </Button>
      {selectedFiles.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Đã chọn {selectedFiles.length} tệp
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useChangeToolApiKey } from "@/hooks/useChangeToolApiKey";
import type { Order } from "@shared/schema";

interface ToolApiKeyModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeApiKeySuccess: () => void;
}

export function ToolApiKeyModal({ order, open, onOpenChange, onChangeApiKeySuccess }: ToolApiKeyModalProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const changeApiKeyMutation = useChangeToolApiKey();

  // Reset form when modal opens/closes or order changes
  useEffect(() => {
    if (open && order?.toolOrder?.apiKey) {
      setApiKey(order.toolOrder.apiKey);
    } else if (!open) {
      setApiKey("");
    }
  }, [open, order]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      await changeApiKeyMutation.mutateAsync({ 
        orderId: order.id, 
        apiKey 
      });
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật API key thành công",
      });
      
      onChangeApiKeySuccess();
      handleOpenChange(false);
    } catch (error: any) {
      console.error("Change API key error:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật API key",
        variant: "destructive",
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thay đổi API Key</DialogTitle>
          <DialogDescription>
            Thay đổi API key cho đơn hàng tool: {order.code}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key mới</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API key mới"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
            >
              Đóng
            </Button>
            <Button 
              type="submit"
              disabled={changeApiKeyMutation.isPending || !apiKey}
            >
              {changeApiKeyMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

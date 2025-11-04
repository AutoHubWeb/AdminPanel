import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSetupVpsOrder, useSetupProxyOrder } from "@/hooks/useOrderSetup";
import type { Order } from "@shared/schema";

interface OrderSetupModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupSuccess: () => void;
}

export function OrderSetupModal({ order, open, onOpenChange, onSetupSuccess }: OrderSetupModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ip: "",
    username: "",
    password: "",
    proxies: "",
    expiredAt: "",
  });
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const setupVpsMutation = useSetupVpsOrder();
  const setupProxyMutation = useSetupProxyOrder();

  // Reset form when modal opens/closes or order changes
  useState(() => {
    if (open && order) {
      setFormData({
        ip: "",
        username: "",
        password: "",
        proxies: "",
        expiredAt: "",
      });
      setDate(undefined);
    }
  });

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format the date to ISO string for the API
      const isoString = selectedDate.toISOString();
      setFormData(prev => ({ ...prev, expiredAt: isoString }));
    } else {
      setFormData(prev => ({ ...prev, expiredAt: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!order) return;

    try {
      if (order.type === "vps" && order.vps) {
        // Setup VPS
        await setupVpsMutation.mutateAsync({
          orderId: order.id,
          data: {
            ip: formData.ip,
            username: formData.username,
            password: formData.password,
          }
        });
        
        toast({
          title: "Thành công",
          description: "Đã setup VPS thành công",
        });
      } else if (order.type === "proxy" && order.proxy) {
        // Setup Proxy
        if (!formData.expiredAt) {
          toast({
            title: "Lỗi",
            description: "Vui lòng chọn ngày hết hạn",
            variant: "destructive",
          });
          return;
        }
        
        await setupProxyMutation.mutateAsync({
          orderId: order.id,
          data: {
            proxies: formData.proxies,
            expiredAt: formData.expiredAt,
          }
        });
        
        toast({
          title: "Thành công",
          description: "Đã setup Proxy thành công",
        });
      }
      
      onSetupSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi setup",
        variant: "destructive",
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {order.type === "vps" ? "Setup VPS" : 
             order.type === "proxy" ? "Setup Proxy" : "Setup"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin cần thiết để setup {order.type === "vps" ? "VPS" : "Proxy"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-4 py-4">
            {order.type === "vps" && order.vps && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address</Label>
                  <Input
                    id="ip"
                    value={formData.ip}
                    onChange={(e) => handleInputChange("ip", e.target.value)}
                    placeholder="192.168.1.1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="admin"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}
            
            {order.type === "proxy" && order.proxy && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="proxies">Proxies</Label>
                  <Textarea
                    id="proxies"
                    value={formData.proxies}
                    onChange={(e) => handleInputChange("proxies", e.target.value)}
                    placeholder="Enter proxy information"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiredAt">Expired At</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={
                (order.type === "vps" && (setupVpsMutation.isPending || !formData.ip || !formData.username || !formData.password)) ||
                (order.type === "proxy" && (setupProxyMutation.isPending || !formData.proxies || !formData.expiredAt))
              }
            >
              {setupVpsMutation.isPending || setupProxyMutation.isPending ? "Đang setup..." : "Setup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

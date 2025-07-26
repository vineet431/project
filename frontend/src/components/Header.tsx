import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

export const Header = ({ title, showNotifications = true, onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu size={20} />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">VendorBuddy</p>
          </div>
        </div>
        
        {showNotifications && (
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
        )}
      </div>
    </header>
  );
};
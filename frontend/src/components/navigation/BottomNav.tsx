import { Home, Search, ShoppingCart, User, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  vendorOnly?: boolean;
  supplierOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/dashboard" },
  // { icon: Search, label: "Search", path: "/search", vendorOnly: true },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  // { icon: Package, label: "Products", path: "/products", supplierOnly: true },
  // { icon: User, label: "Profile", path: "/profile" },
];

interface BottomNavProps {
  userType: "vendor" | "supplier";
}

export const BottomNav = ({ userType }: BottomNavProps) => {
  const location = useLocation();

  const filteredItems = navItems.filter((item) => {
    if (item.vendorOnly && userType !== "vendor") return false;
    if (item.supplierOnly && userType !== "supplier") return false;
    return true;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
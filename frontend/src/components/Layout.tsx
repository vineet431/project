import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
};

export const Container = ({ children, className }: LayoutProps) => {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {children}
    </div>
  );
};
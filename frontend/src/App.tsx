import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Page Imports
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GroupOrders from "./pages/GroupOrders";
import OrderTracking from "./pages/OrderTracking";
import RatingSystem from "./pages/RatingSystem";
import NotFound from "./pages/NotFound";
import CreateOrder from "./pages/CreateOrder";
// 🔁 Optional: If you have this page
import SupplierProducts from "./pages/SupplierProducts";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<GroupOrders />} />
            <Route path="/search" element={<GroupOrders />} />
            <Route path="/products" element={<GroupOrders />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/vendor/create-order" element={<CreateOrder />} />
            <Route path="/supplier/:id/products" element={<SupplierProducts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

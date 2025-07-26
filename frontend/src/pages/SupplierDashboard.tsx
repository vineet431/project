import { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  TrendingUp,
  Users,
  Plus,
  Edit,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Layout, Container } from "@/components/Layout";
import { BottomNav } from "@/components/navigation/BottomNav";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock";
}

interface GroupOrderRequest {
  id: string;
  title: string;
  requester: string;
  items: number;
  totalValue: number;
  participants: number;
  status: "pending" | "accepted" | "rejected";
  deadline: string;
}

interface SupplierDashboardResponse {
  products: Product[];
  groupOrderRequests: GroupOrderRequest[];
  totalSavings: number;
  vendorCount: number;
}

interface MeResponse {
  user: {
    id: string;
    email: string;
    FullName: string;
    BusinessName: string;
    userType: string;
  };
}

export default function SupplierDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderRequests, setOrderRequests] = useState<GroupOrderRequest[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [vendorCount, setVendorCount] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [supplierId, setSupplierId] = useState<string>("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    unit: "",
    stock: "",
    status: "available" as "available" | "low_stock" | "out_of_stock",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboardRes, meRes] = await Promise.all([
          axios.get<SupplierDashboardResponse>(
            `${BASE_URL}/supplier/dashboard-data`,
            { withCredentials: true }
          ),
          axios.get<MeResponse>(`${BASE_URL}/me`, {
            withCredentials: true,
          }),
        ]);

        setProducts(dashboardRes.data.products);
        setOrderRequests(dashboardRes.data.groupOrderRequests);
        setTotalSavings(dashboardRes.data.totalSavings);
        setVendorCount(dashboardRes.data.vendorCount);

        const fetchedSupplierId = meRes.data.user.id;
        setSupplierId(fetchedSupplierId);
        console.log("Fetched supplierId:", fetchedSupplierId);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    }

    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!supplierId || supplierId.trim() === "") {
      alert("Supplier ID not available. Please try again later.");
      return;
    }

    console.log("Adding product for supplierId:", supplierId);

    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category.trim(),
      price: Number(newProduct.price),
      unit: newProduct.unit.trim(),
      stock: Number(newProduct.stock),
      status: newProduct.status,
      supplierId,
    };

    if (
      !payload.name ||
      !payload.category ||
      !payload.unit ||
      isNaN(payload.price) ||
      isNaN(payload.stock)
    ) {
      return alert("Please fill in all fields correctly");
    }

    try {
      const res = await axios.post<{ product: Product }>(
        `${BASE_URL}/supplier/add-product`,
        payload,
        { withCredentials: true }
      );

      setProducts((prev) => [...prev, res.data.product]);
      setShowAddModal(false);
      setNewProduct({
        name: "",
        category: "",
        price: "",
        unit: "",
        stock: "",
        status: "available",
      });
    } catch (error: any) {
      console.error("Failed to add product:", error.response?.data || error.message);
      alert(
        "Failed to add product: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleOrderRequest = (orderId: string, action: "accept" | "reject") => {
    setOrderRequests((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: action === "accept" ? "accepted" : "rejected" }
          : order
      )
    );
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  };

  return (
    <Layout>
      <Header title="Supplier Dashboard" />
      <Container className="pb-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="mx-auto mb-2 text-primary" size={20} />
              <p className="text-xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-green-600" size={20} />
              <p className="text-xl font-bold">₹{totalSavings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 text-blue-600" size={20} />
              <p className="text-xl font-bold">{vendorCount}</p>
              <p className="text-xs text-muted-foreground">Active Vendors</p>
            </CardContent>
          </Card>
        </div>

        {/* Group Orders */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Group Order Requests</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {orderRequests.filter((o) => o.status === "pending").length} Pending
            </Badge>
          </div>

          <div className="space-y-4">
            {orderRequests.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{order.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Requested by {order.requester}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        order.status === "pending"
                          ? "border-yellow-500 text-yellow-500"
                          : order.status === "accepted"
                          ? "border-green-500 text-green-500"
                          : "border-red-500 text-red-500"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                    <div>
                      <p className="font-medium text-foreground">{order.items}</p>
                      <p>Items</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">₹{order.totalValue}</p>
                      <p>Total Value</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.participants}</p>
                      <p>Participants</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Deadline: {order.deadline}
                    </p>
                    {order.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOrderRequest(order.id, "reject")}
                        >
                          <X size={14} className="mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOrderRequest(order.id, "accept")}
                        >
                          <Check size={14} className="mr-1" />
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Product Inventory */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Product Inventory</h2>
            <Button size="sm" onClick={() => setShowAddModal(true)} disabled={!supplierId}>
              <Plus size={16} className="mr-2" />
              Add Product
            </Button>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ₹{product.price} per {product.unit}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          {product.stock} {product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">In Stock</p>
                      </div>
                      <Badge className={getStockStatusColor(product.status)}>
                        {getStockStatusText(product.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            <div className="space-y-2">
              <input
                placeholder="Name"
                className="w-full border px-3 py-2 rounded"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <input
                placeholder="Category"
                className="w-full border px-3 py-2 rounded"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, category: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full border px-3 py-2 rounded"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                }
              />
              <input
                placeholder="Unit"
                className="w-full border px-3 py-2 rounded"
                value={newProduct.unit}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, unit: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Stock"
                className="w-full border px-3 py-2 rounded"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
              <select
                className="w-full border px-3 py-2 rounded"
                value={newProduct.status}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    status: e.target.value as "available" | "low_stock" | "out_of_stock",
                  }))
                }
              >
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>Add</Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav userType="supplier" />
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { Search, Users, ShoppingCart, Plus, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Layout, Container } from "@/components/Layout";
import { BottomNav } from "@/components/navigation/BottomNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface GroupOrder {
  id: string;
  title: string;
  supplier: string;
  totalItems: number;
  currentMembers: number;
  maxMembers: number;
  deadline: string;
  savings: string;
}

interface Supplier {
  id: string;
  name: string;
  distance: string;
  rating: number;
  specialties: string[];
  verified: boolean;
}

interface DashboardResponse {
  groupOrders: GroupOrder[];
  suppliers: Supplier[];
  savedThisMonth: number;
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [savedThisMonth, setSavedThisMonth] = useState(0);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get<DashboardResponse>(
        `${BASE_URL}/vendor/dashboard-data`,
        { withCredentials: true }
      );
      setGroupOrders(response.data.groupOrders);
      setSuppliers(response.data.suppliers);
      setSavedThisMonth(response.data.savedThisMonth);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

 const joinGroupOrder = async (orderId: string) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/group-orders/${orderId}/join`,
      {},
      { withCredentials: true }
    );

    const updatedOrder = res.data as GroupOrder;
    setGroupOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  } catch (error) {
    console.error("Failed to join group order", error);
    alert("Failed to join order or group is full");
  }
};


  return (
    <Layout>
      <Header title="Vendor Dashboard" />

      <Container className="pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold">{groupOrders.length}</p>
              <p className="text-sm text-muted-foreground">Active Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 text-success" size={24} />
              <p className="text-2xl font-bold">₹{savedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Saved This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search for suppliers or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Group Orders */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Group Orders</h2>
            {/* <Button variant="outline" size="sm" onClick={() => navigate("/vendor/create-order")}>
              <Plus size={16} className="mr-2" />
              Create Order
            </Button> */}
          </div>

          <div className="space-y-4">
            {groupOrders.map((order) => {
              const progress = (order.currentMembers / order.maxMembers) * 100;

              return (
                <Card key={order.id} className="vendor-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{order.title}</h3>
                        <p className="text-sm text-muted-foreground">{order.supplier}</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Save {order.savings}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{order.totalItems} items</span>
                      <span>{order.currentMembers}/{order.maxMembers} members</span>
                      <span>{order.deadline}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex-1 bg-muted rounded-full h-2 mr-3">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => joinGroupOrder(order.id)}
                        disabled={order.currentMembers >= order.maxMembers}
                      >
                        {order.currentMembers >= order.maxMembers ? "Full" : "Join Order"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Nearby Suppliers */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Nearby Suppliers</h2>
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="vendor-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{supplier.name}</h3>
                        {supplier.verified && (
                          <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin size={14} />
                        <span>{supplier.distance}</span>
                        <span>•</span>
                        <span>⭐ {supplier.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {supplier.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/supplier/${supplier.id}/products`)}
                    >
                      View Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      <BottomNav userType="vendor" />
    </Layout>
  );
}

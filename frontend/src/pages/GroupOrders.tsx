import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Clock, Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Layout, Container } from "@/components/Layout";
import { BottomNav } from "@/components/navigation/BottomNav";

interface GroupOrder {
  id: string;
  title: string;
  supplier: string;
  category: string;
  totalItems: number;
  currentMembers: number;
  maxMembers: number;
  pricePerPerson: number;
  totalSavings: string;
  deadline: string;
  status: "open" | "closed" | "completed";
  items: string[];
  createdBy: string;
  minimumOrder: number;
}

export default function GroupOrders() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const userType = localStorage.getItem("userType") as "vendor" | "supplier";

  useEffect(() => {
    async function fetchGroupOrders() {
      try {
        const response = await axios.get<GroupOrder[]>(`${BASE_URL}/group-orders`, {
          withCredentials: true,
        });
        setGroupOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch group orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGroupOrders();
  }, []);

  const filteredOrders = groupOrders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "open") return order.status === "open";
    return order.category.toLowerCase().includes(filter);
  });

  const joinOrder = (orderId: string) => {
    alert(`Joined group order ${orderId}!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-success/10 text-success";
      case "closed":
        return "bg-warning/10 text-warning";
      case "completed":
        return "bg-muted/10 text-muted-foreground";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <Layout>
      <Header title="Group Orders" />
      <Container className="pb-20">
        {/* Filter & Create Button */}
        <div className="flex items-center gap-3 mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="open">Open Orders</SelectItem>
              <SelectItem value="grains">Grains & Oils</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="spices">Spices</SelectItem>
              <SelectItem value="essentials">Essentials</SelectItem>
            </SelectContent>
          </Select>

            <Button variant="outline" size="sm" onClick={() => navigate("/vendor/create-order")}>
              <Plus size={16} className="mr-2" />
              Create Order
            </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="mx-auto mb-2 text-primary" size={20} />
              <p className="text-xl font-bold">{filteredOrders.filter((o) => o.status === "open").length}</p>
              <p className="text-xs text-muted-foreground">Open Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 text-accent" size={20} />
              <p className="text-xl font-bold">
                {filteredOrders.reduce((sum, order) => sum + order.currentMembers, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 text-success" size={20} />
              <p className="text-xl font-bold">
                {filteredOrders.filter((o) => o.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {loading ? (
          <p>Loading group orders...</p>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="font-medium mb-2">No group orders found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to create a group order and save money together!
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/vendor/create-order")}>Create Group Order</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="vendor-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{order.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {order.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{order.supplier}</p>
                      <p className="text-xs text-muted-foreground">Created by {order.createdBy}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === "open"
                          ? "Open"
                          : order.status === "closed"
                          ? "Closed"
                          : "Completed"}
                      </Badge>
                      {order.status === "open" && (
                        <p className="text-sm text-muted-foreground mt-1">{order.deadline}</p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price per person:</span>
                      <span className="font-medium">₹{order.pricePerPerson}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Savings:</span>
                      <span className="font-medium text-success">{order.totalSavings}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-medium">
                        {order.currentMembers}/{order.maxMembers}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round((order.currentMembers / order.maxMembers) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          order.currentMembers >= order.minimumOrder ? "bg-primary" : "bg-warning"
                        }`}
                        style={{ width: `${(order.currentMembers / order.maxMembers) * 100}%` }}
                      />
                    </div>
                    {order.currentMembers < order.minimumOrder && (
                      <p className="text-xs text-warning mt-1">
                        Minimum {order.minimumOrder} members required
                      </p>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Items included:</p>
                    <div className="flex flex-wrap gap-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {order.items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{order.items.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {order.status === "open" && userType === "vendor" && (
                      <Button size="sm" className="flex-1" onClick={() => joinOrder(order.id)}>
                        Join Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
      <BottomNav userType={userType} />
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Truck
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Layout, Container } from "@/components/Layout";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface OrderTrackingData {
  id: string;
  title: string;
  supplier: string;
  status: "confirmed" | "preparing" | "ready" | "delivered";
  orderDate: string;
  estimatedDelivery: string;
  items: OrderItem[];
  totalAmount: number;
  supplierPhone: string;
  supplierAddress: string;
}

const trackingSteps = [
  { status: "confirmed", label: "Order Confirmed", icon: CheckCircle },
  { status: "preparing", label: "Preparing Order", icon: Package },
  { status: "ready", label: "Ready for Pickup", icon: Clock },
  { status: "delivered", label: "Delivered", icon: Truck }
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await axios.get<OrderTrackingData>(
          `${BASE_URL}/order-tracking/${id}`,
          {
            withCredentials: true
          }
        );
        setOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch order tracking data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const getStepStatus = (stepStatus: string) => {
    const statusIndex = trackingSteps.findIndex(step => step.status === stepStatus);
    const currentIndex = trackingSteps.findIndex(step => step.status === order?.status);

    if (statusIndex <= currentIndex) return "completed";
    if (statusIndex === currentIndex + 1) return "active";
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-primary/10 text-primary";
      case "preparing": return "bg-warning/10 text-warning";
      case "ready": return "bg-accent/10 text-accent";
      case "delivered": return "bg-success/10 text-success";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  if (loading) {
    return <Layout><Container><p>Loading...</p></Container></Layout>;
  }

  if (!order) {
    return <Layout><Container><p>Order not found.</p></Container></Layout>;
  }

  return (
    <Layout>
      <Header 
        title="Order Tracking" 
        showNotifications={false}
        onMenuClick={() => navigate(-1)}
      />

      <Container className="pb-6">
        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{order.title}</CardTitle>
                <CardDescription>Order #{order.id}</CardDescription>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{order.orderDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Delivery</p>
                <p className="font-medium">{order.estimatedDelivery}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingSteps.map((step) => {
                const status = getStepStatus(step.status);
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full
                      ${status === "completed" ? "bg-primary text-primary-foreground" :
                        status === "active" ? "bg-accent text-accent-foreground" :
                        "bg-muted text-muted-foreground"
                      }
                    `}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        status === "completed" || status === "active" 
                          ? "text-foreground" 
                          : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </p>
                      {status === "active" && (
                        <p className="text-sm text-muted-foreground">In Progress</p>
                      )}
                    </div>
                    {status === "completed" && (
                      <CheckCircle size={16} className="text-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Supplier Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{order.supplier}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span>{order.supplierAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Call Supplier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.price}</p>
                </div>
              ))}
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditional Buttons */}
        {order.status === "delivered" && (
          <div className="space-y-3">
            <Button className="w-full">
              Rate & Review Supplier
            </Button>
            <Button variant="outline" className="w-full">
              Reorder Items
            </Button>
          </div>
        )}

        {order.status === "ready" && (
          <Button className="w-full">
            Confirm Pickup
          </Button>
        )}
      </Container>
    </Layout>
  );
}
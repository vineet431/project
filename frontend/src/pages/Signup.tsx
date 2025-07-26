import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Store, Truck } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    businessName: "",
    address: ""
  });

  const [userType, setUserType] = useState<"vendor" | "supplier">("vendor");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    const payload = {
      email: formData.email,
      FullName: formData.name,
      BusinessName: formData.businessName,
      phonenuber: formData.phone,
      localtion: formData.address,
      Password: formData.password,
      userType: userType
    };

    try {
      const response = await axios.post(`${BASE_URL}/signup`, payload, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      // ✅ Show success message and redirect to login
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      const message =
        err.response?.data?.message || err.message || "Signup failed";
      alert("Signup failed: " + message);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout className="flex items-center justify-center p-4 gradient-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">VendorBuddy</h1>
          <p className="text-white/80">Join our community today</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Get started with VendorBuddy</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={userType}
              onValueChange={(value) => setUserType(value as "vendor" | "supplier")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vendor" className="flex items-center gap-2">
                  <Store size={16} />
                  Vendor
                </TabsTrigger>
                <TabsTrigger value="supplier" className="flex items-center gap-2">
                  <Truck size={16} />
                  Supplier
                </TabsTrigger>
              </TabsList>

              {["vendor", "supplier"].map(type => (
                <TabsContent key={type} value={type} className="mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <InputBlock
                      id="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={e => updateFormData("name", e.target.value)}
                    />
                    <InputBlock
                      id="businessName"
                      label="Business Name"
                      value={formData.businessName}
                      onChange={e => updateFormData("businessName", e.target.value)}
                    />
                    <InputBlock
                      id="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={e => updateFormData("email", e.target.value)}
                    />
                    <InputBlock
                      id="phone"
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={e => updateFormData("phone", e.target.value)}
                    />
                    <InputBlock
                      id="address"
                      label="Location/Address"
                      value={formData.address}
                      onChange={e => updateFormData("address", e.target.value)}
                    />
                    <InputBlock
                      id="password"
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={e => updateFormData("password", e.target.value)}
                    />
                    <InputBlock
                      id="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => updateFormData("confirmPassword", e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                      Sign Up as {type === "vendor" ? "Vendor" : "Supplier"}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function InputBlock({
  id,
  label,
  value,
  onChange,
  type = "text"
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

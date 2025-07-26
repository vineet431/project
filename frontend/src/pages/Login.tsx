import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Store, Truck } from "lucide-react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"vendor" | "supplier">("vendor");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:3000/signin`,
        { email, Password: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // ✅ Store login state and user type
      localStorage.setItem("userType", userType);
      localStorage.setItem("isLoggedIn", "true");

      alert("Login successful!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Login failed!";
      alert("Login failed: " + msg);
    }
  };

  return (
    <Layout className="flex items-center justify-center p-4 gradient-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">VendorBuddy</h1>
          <p className="text-white/80">Connecting vendors with suppliers</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as "vendor" | "supplier")}>
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

              {["vendor", "supplier"].map((type) => (
                <TabsContent key={type} value={type} className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${type}-email`}>Email</Label>
                      <Input
                        id={`${type}-email`}
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${type}-password`}>Password</Label>
                      <Input
                        id={`${type}-password`}
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Sign In as {type === "vendor" ? "Vendor" : "Supplier"}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

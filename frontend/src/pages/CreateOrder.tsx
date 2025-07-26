import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Layout, Container } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Define Supplier type
type Supplier = {
  id: string;
  name: string;
};

export default function CreateOrder() {
  const navigate = useNavigate();
  

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    totalItems: 0,
    maxMembers: 10,
    deadline: "",
    savings: "",
    supplierId: "",
  });

  // ✅ Fetch suppliers
  useEffect(() => {
    axios
      .get<Supplier[]>(`${BASE_URL}/suppliers`, { withCredentials: true })
      .then((res) => setSuppliers(res.data))
      .catch((err) => console.error("Failed to fetch suppliers:", err));
  }, []);

  // ✅ Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalItems" || name === "maxMembers" ? Number(value) : value,
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = async () => {
    try {
      const { title, totalItems, maxMembers, deadline, savings, supplierId } = formData;

      // Basic validation
      if (!title || !deadline || !savings || !supplierId || totalItems <= 0 || maxMembers <= 0) {
        alert("Please fill in all required fields.");
        return;
      }

      await axios.post(
        `${BASE_URL}/group-orders`,
        {
          ...formData,
          deadline: deadline.toString(),
          savings: savings.toString(),
        },
        { withCredentials: true }
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create group order:", error);
      alert("Failed to create group order. Please try again.");
    }
  };

  return (
    <Layout>
      <Container>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create New Group Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="totalItems">Total Items</Label>
              <Input
                id="totalItems"
                name="totalItems"
                type="number"
                min={1}
                value={formData.totalItems}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="maxMembers">Max Members</Label>
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min={1}
                value={formData.maxMembers}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                placeholder="e.g., 2025-08-05"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="savings">Savings</Label>
              <Input
                id="savings"
                name="savings"
                placeholder="e.g., 10%"
                value={formData.savings}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="supplierId">Select Supplier</Label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="">-- Select a supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSubmit}>Create Order</Button>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
}

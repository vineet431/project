import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Layout, Container } from "@/components/Layout";
import { Button } from "@/components/ui/button";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the Product interface
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  status: string;
}

// Define the expected response structure
interface ProductResponse {
  products: Product[];
}

export default function SupplierProducts() {
  const { id } = useParams(); // supplierId from the URL
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get<ProductResponse>(
          `${BASE_URL}/supplier/${id}/products`,
          { withCredentials: true }
        );
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProducts();
    }
  }, [id]);

  return (
    <Layout>
      <Header title="Supplier Products" />

      <Container className="py-6">
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available for this supplier.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="text-sm mt-1">
                        ₹{product.price} / {product.unit}
                      </p>
                      <p className="text-sm mt-1">Stock: {product.stock}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {product.status}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Layout>
  );
}

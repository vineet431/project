import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorDashboard from "./VendorDashboard";
import SupplierDashboard from "./SupplierDashboard";

type MeResponse = {
  user: {
    userType: "vendor" | "supplier";
    email: string;
    FullName: string;
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"vendor" | "supplier" | null>(null);
  const [loading, setLoading] = useState(true);
 const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get<MeResponse>(`${BASE_URL}/me`, {
          withCredentials: true,
        });

        const type = response.data.user.userType;
        setUserType(type);
      } catch (err) {
        console.error("Not authenticated:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading dashboard...</div>;
  }

  if (!userType) {
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to determine user type. Please{" "}
        <button onClick={() => navigate("/login")} className="underline text-blue-600">
          login again
        </button>
        .
      </div>
    );
  }

  return userType === "vendor" ? <VendorDashboard /> : <SupplierDashboard />;
}

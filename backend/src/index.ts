import express from "express";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();


const allowedOrigins = [
  "https://project-phi-rosy-65.vercel.app", 
  "http://localhost:5173"                
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());

// ------------------- Signup -------------------
app.post("/signup", async (req, res) => {
  const {
    email,
    FullName,
    BusinessName,
    phonenuber,
    localtion,
    Password,
    userType,
  } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    if (userType === "supplier") {
      // Create supplier record first
      const supplier = await prisma.supplier.create({
        data: {
          name: BusinessName,
          distance: "", // Add default or receive from req.body if you want
          rating: 0,
          verified: false,
          specialties: [], // Empty array or receive from req.body
        },
      });

      // Create user linked to supplier
      const result = await prisma.user.create({
        data: {
          email,
          FullName,
          BusinessName,
          phonenuber,
          localtion,
          Password: hashedPassword,
          userType,
          supplierId: supplier.id,
        },
      });

      const { Password: _, ...userWithoutPassword } = result;
      return res.status(201).json({ message: "New supplier user created", user: userWithoutPassword });
    } else {
      // Create normal user without supplier
      const result = await prisma.user.create({
        data: {
          email,
          FullName,
          BusinessName,
          phonenuber,
          localtion,
          Password: hashedPassword,
          userType,
        },
      });

      const { Password: _, ...userWithoutPassword } = result;
      return res.status(201).json({ message: "New user created", user: userWithoutPassword });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

// ------------------- Signin -------------------
app.post("/signin", async (req, res) => {
  const { email, Password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(Password, user.Password);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid password" });

    // ✅ Set cookie with proper cross-origin credentials
        res.cookie("userEmail", user.email, {
          httpOnly: true,
          secure: true,
          sameSite: "none", // ✅ lowercase
          maxAge: 24 * 60 * 60 * 1000,
        });


    const { Password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ message: "Signed in successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// ------------------- Me -------------------
app.get("/me", async (req, res) => {
  const email = req.cookies.userEmail;

  if (!email) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { supplier: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { Password, supplier, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
      supplierId: supplier ? supplier.id : null,
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------- Vendor Dashboard -------------------
app.get("/vendor/dashboard-data", async (req, res) => {
  const email = req.cookies.userEmail;

  if (!email) return res.status(401).json({ message: "Not authenticated" });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { savedThisMonth: true },
    });

    const groupOrders = await prisma.groupOrder.findMany();
    const suppliers = await prisma.supplier.findMany();

    res.json({
      groupOrders,
      suppliers,
      savedThisMonth: user?.savedThisMonth ?? 0,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

// ------------------- Supplier Dashboard -------------------
app.get("/supplier/dashboard-data", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const groupOrderRequests = await prisma.groupOrderRequest.findMany();

    const totalSavings = await prisma.user.aggregate({
      _sum: { savedThisMonth: true },
    });

    const vendorCount = await prisma.user.count({ where: { userType: "vendor" } });

    res.status(200).json({
      products,
      groupOrderRequests,
      totalSavings: totalSavings._sum.savedThisMonth ?? 0,
      vendorCount,
    });
  } catch (error) {
    console.error("Supplier dashboard error:", error);
    res.status(500).json({ message: "Failed to fetch supplier dashboard data" });
  }
});

// ------------------- Add Product -------------------
app.post("/supplier/add-product", async (req, res) => {
  const { name, category, price, unit, stock, status, supplierId: userId } = req.body;

  if (!name || !category || !unit || !status || !userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Step 1: Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { supplier: true },
    });

    if (!user || !user.supplier) {
      return res.status(400).json({ message: "User is not a supplier" });
    }

    // Step 2: Extract actual supplierId
    const actualSupplierId = user.supplier.id;

    // Step 3: Create product with that supplierId
    const newProduct = await prisma.product.create({
      data: {
        name,
        category,
        price,
        unit,
        stock,
        status,
        supplierId: actualSupplierId,
      },
    });

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});
app.get("/supplier/:id/products", async (req, res) => {
  const supplierId = req.params.id;

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: { products: true }, // 👈 Fetch products
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ products: supplier.products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/group-orders", async (req, res) => {
  try {
    const groupOrders = await prisma.groupOrderRequest.findMany({
      include: {
        supplier: true, // if you want supplier details
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(groupOrders);
  } catch (error) {
    console.error("Failed to fetch group orders:", error);
    res.status(500).json({ error: "Failed to fetch group orders" });
  }
});
app.get("/group-orders/active", async (req, res) => {
  try {
    const groupOrders = await prisma.groupOrder.findMany({
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response to match your frontend expectation
    const formattedOrders = groupOrders.map((order) => ({
      id: order.id,
      title: order.title,
      supplier: order.supplier.name,
      totalItems: order.totalItems,
      currentMembers: order.currentMembers,
      maxMembers: order.maxMembers,
      deadline: order.deadline,
      savings: order.savings,
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Failed to fetch active group orders:", error);
    res.status(500).json({ error: "Failed to fetch active group orders" });
  }
});
app.post("/group-orders", async (req, res) => {
  try {
    const { title, totalItems, maxMembers, deadline, savings, supplierId } = req.body;

    const newGroupOrder = await prisma.groupOrder.create({
      data: {
        title,
        totalItems: Number(totalItems),
        currentMembers: 0, // you must include this
        maxMembers: Number(maxMembers),
        deadline: deadline.toString(), // ensure it's string, e.g. "2025-07-26"
        savings: savings.toString(),   // convert savings to string explicitly
        supplier: {
          connect: { id: supplierId }
        }
      }
    });

    res.status(201).json(newGroupOrder);
  } catch (error) {
    console.error("Failed to create group order:", error);
    res.status(500).json({ error: "Failed to create group order" });
  }
});


// GET /order-tracking/:id
app.get("/order-tracking/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.orderTracking.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      id: order.id,
      title: order.title,
      supplier: order.supplier,
      status: order.status,
      orderDate: order.orderDate,
      estimatedDelivery: order.estimatedDelivery,
      supplierPhone: order.supplierPhone,
      supplierAddress: order.supplierAddress,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
      })),
    });
  } catch (error) {
    console.error("Error fetching order tracking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    console.error("Failed to fetch suppliers", error);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});
app.post("/group-orders/:id/join", async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.groupOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: "Group order not found" });
    }

    if (order.currentMembers >= order.maxMembers) {
      return res.status(400).json({ error: "Group is already full" });
    }

    const updatedOrder = await prisma.groupOrder.update({
      where: { id },
      data: {
        currentMembers: {
          increment: 1,
        },
      },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error("Failed to join group order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ------------------- Start Server -------------------
app.listen(3000, () => {
  console.log("✅ Backend is up at port 3000");
});

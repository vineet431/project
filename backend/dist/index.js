"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// ------------------- Signup -------------------
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, FullName, BusinessName, phonenuber, localtion, Password, userType, } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(Password, 10);
        if (userType === "supplier") {
            // Create supplier record first
            const supplier = yield prisma.supplier.create({
                data: {
                    name: BusinessName,
                    distance: "", // Add default or receive from req.body if you want
                    rating: 0,
                    verified: false,
                    specialties: [], // Empty array or receive from req.body
                },
            });
            // Create user linked to supplier
            const result = yield prisma.user.create({
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
            const { Password: _ } = result, userWithoutPassword = __rest(result, ["Password"]);
            return res.status(201).json({ message: "New supplier user created", user: userWithoutPassword });
        }
        else {
            // Create normal user without supplier
            const result = yield prisma.user.create({
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
            const { Password: _ } = result, userWithoutPassword = __rest(result, ["Password"]);
            return res.status(201).json({ message: "New user created", user: userWithoutPassword });
        }
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// ------------------- Signin -------------------
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, Password } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const passwordMatch = yield bcrypt_1.default.compare(Password, user.Password);
        if (!passwordMatch)
            return res.status(401).json({ message: "Invalid password" });
        // Set cookie
        res.cookie("userEmail", user.email, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });
        const { Password: _ } = user, userWithoutPassword = __rest(user, ["Password"]);
        return res.status(200).json({ message: "Signed in successfully", user: userWithoutPassword });
    }
    catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// ------------------- Me -------------------
app.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.cookies.userEmail;
    if (!email)
        return res.status(401).json({ message: "Not authenticated" });
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
            include: { supplier: true },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const { Password, supplier } = user, userWithoutPassword = __rest(user, ["Password", "supplier"]);
        return res.status(200).json({
            user: userWithoutPassword,
            supplierId: supplier ? supplier.id : null,
        });
    }
    catch (error) {
        console.error("Me error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
// ------------------- Vendor Dashboard -------------------
app.get("/vendor/dashboard-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const email = req.cookies.userEmail;
    if (!email)
        return res.status(401).json({ message: "Not authenticated" });
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
            select: { savedThisMonth: true },
        });
        const groupOrders = yield prisma.groupOrder.findMany();
        const suppliers = yield prisma.supplier.findMany();
        res.json({
            groupOrders,
            suppliers,
            savedThisMonth: (_a = user === null || user === void 0 ? void 0 : user.savedThisMonth) !== null && _a !== void 0 ? _a : 0,
        });
    }
    catch (error) {
        console.error("Dashboard fetch error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
}));
// ------------------- Supplier Dashboard -------------------
app.get("/supplier/dashboard-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const products = yield prisma.product.findMany();
        const groupOrderRequests = yield prisma.groupOrderRequest.findMany();
        const totalSavings = yield prisma.user.aggregate({
            _sum: { savedThisMonth: true },
        });
        const vendorCount = yield prisma.user.count({ where: { userType: "vendor" } });
        res.status(200).json({
            products,
            groupOrderRequests,
            totalSavings: (_a = totalSavings._sum.savedThisMonth) !== null && _a !== void 0 ? _a : 0,
            vendorCount,
        });
    }
    catch (error) {
        console.error("Supplier dashboard error:", error);
        res.status(500).json({ message: "Failed to fetch supplier dashboard data" });
    }
}));
// ------------------- Add Product -------------------
app.post("/supplier/add-product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category, price, unit, stock, status, supplierId: userId } = req.body;
    if (!name || !category || !unit || !status || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        // Step 1: Find the user
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { supplier: true },
        });
        if (!user || !user.supplier) {
            return res.status(400).json({ message: "User is not a supplier" });
        }
        // Step 2: Extract actual supplierId
        const actualSupplierId = user.supplier.id;
        // Step 3: Create product with that supplierId
        const newProduct = yield prisma.product.create({
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
    }
    catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Failed to add product" });
    }
}));
app.get("/supplier/:id/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supplierId = req.params.id;
    try {
        const supplier = yield prisma.supplier.findUnique({
            where: { id: supplierId },
            include: { products: true }, // 👈 Fetch products
        });
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.json({ products: supplier.products });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/group-orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupOrders = yield prisma.groupOrderRequest.findMany({
            include: {
                supplier: true, // if you want supplier details
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(groupOrders);
    }
    catch (error) {
        console.error("Failed to fetch group orders:", error);
        res.status(500).json({ error: "Failed to fetch group orders" });
    }
}));
app.get("/group-orders/active", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupOrders = yield prisma.groupOrder.findMany({
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
    }
    catch (error) {
        console.error("Failed to fetch active group orders:", error);
        res.status(500).json({ error: "Failed to fetch active group orders" });
    }
}));
app.post("/group-orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, totalItems, maxMembers, deadline, savings, supplierId } = req.body;
        const newGroupOrder = yield prisma.groupOrder.create({
            data: {
                title,
                totalItems: Number(totalItems),
                currentMembers: 0, // you must include this
                maxMembers: Number(maxMembers),
                deadline: deadline.toString(), // ensure it's string, e.g. "2025-07-26"
                savings: savings.toString(), // convert savings to string explicitly
                supplier: {
                    connect: { id: supplierId }
                }
            }
        });
        res.status(201).json(newGroupOrder);
    }
    catch (error) {
        console.error("Failed to create group order:", error);
        res.status(500).json({ error: "Failed to create group order" });
    }
}));
// GET /order-tracking/:id
app.get("/order-tracking/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const order = yield prisma.orderTracking.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching order tracking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/suppliers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suppliers = yield prisma.supplier.findMany();
        res.json(suppliers);
    }
    catch (error) {
        console.error("Failed to fetch suppliers", error);
        res.status(500).json({ error: "Failed to fetch suppliers" });
    }
}));
app.post("/group-orders/:id/join", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const order = yield prisma.groupOrder.findUnique({
            where: { id },
        });
        if (!order) {
            return res.status(404).json({ error: "Group order not found" });
        }
        if (order.currentMembers >= order.maxMembers) {
            return res.status(400).json({ error: "Group is already full" });
        }
        const updatedOrder = yield prisma.groupOrder.update({
            where: { id },
            data: {
                currentMembers: {
                    increment: 1,
                },
            },
        });
        res.json(updatedOrder);
    }
    catch (err) {
        console.error("Failed to join group order:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// ------------------- Start Server -------------------
app.listen(3000, () => {
    console.log("✅ Backend is up at port 3000");
});

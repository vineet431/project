-- CreateTable
CREATE TABLE "OrderTracking" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "orderDate" TEXT NOT NULL,
    "estimatedDelivery" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "supplierPhone" TEXT NOT NULL,
    "supplierAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderTrackingId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderTrackingId_fkey" FOREIGN KEY ("orderTrackingId") REFERENCES "OrderTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

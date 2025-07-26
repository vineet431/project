-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "specialties" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupOrder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "currentMembers" INTEGER NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "deadline" TEXT NOT NULL,
    "savings" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupOrder" ADD CONSTRAINT "GroupOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "user" (
    "email" TEXT NOT NULL,
    "FullName" TEXT NOT NULL,
    "BusinessName" TEXT NOT NULL,
    "phonenuber" TEXT NOT NULL,
    "localtion" TEXT NOT NULL,
    "Password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("email")
);

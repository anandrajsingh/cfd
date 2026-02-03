-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "OrderState" AS ENUM ('CREATED', 'ACTIVE', 'FILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ActiveOrder" (
    "id" TEXT NOT NULL,
    "asset" "Asset" NOT NULL,
    "type" "TradeType" NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "limitPrice" INTEGER,
    "margin" INTEGER NOT NULL,
    "leverage" INTEGER NOT NULL,
    "takeProfit" INTEGER,
    "stopLoss" INTEGER,
    "state" "OrderState" NOT NULL DEFAULT 'CREATED',
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActiveOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActiveOrder" ADD CONSTRAINT "ActiveOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

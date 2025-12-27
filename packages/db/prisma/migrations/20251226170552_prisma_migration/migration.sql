-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "Asset" AS ENUM ('BTC', 'SOL', 'ETH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 500000,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "asset" "Asset" NOT NULL,
    "type" "TradeType" NOT NULL,
    "margin" INTEGER NOT NULL,
    "leverage" INTEGER NOT NULL,
    "entryPrice" INTEGER NOT NULL,
    "positionSize" INTEGER NOT NULL,
    "liquidationPrice" INTEGER NOT NULL,
    "takeProfit" INTEGER,
    "stopLoss" INTEGER,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosedPosition" (
    "id" TEXT NOT NULL,
    "asset" "Asset" NOT NULL,
    "type" "TradeType" NOT NULL,
    "margin" INTEGER NOT NULL,
    "leverage" INTEGER NOT NULL,
    "entryPrice" INTEGER NOT NULL,
    "exitPrice" INTEGER NOT NULL,
    "positionSize" INTEGER NOT NULL,
    "realizedPnl" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ClosedPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceTick" (
    "time" TIMESTAMP(3) NOT NULL,
    "asset" "Asset" NOT NULL,
    "price" BIGINT NOT NULL,

    CONSTRAINT "PriceTick_pkey" PRIMARY KEY ("asset","time")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PriceTick_asset_time_idx" ON "PriceTick"("asset", "time");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClosedPosition" ADD CONSTRAINT "ClosedPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

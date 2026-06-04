-- CreateEnum
CREATE TYPE "PriceBadge" AS ENUM ('NEGOTIABLE', 'NON_NEGOTIABLE');

-- DropForeignKey
ALTER TABLE "SellerGadget" DROP CONSTRAINT IF EXISTS "SellerGadget_gadgetId_fkey";

-- DropPrimaryKey
ALTER TABLE "SellerGadget" DROP CONSTRAINT IF EXISTS "SellerGadget_pkey";

-- AlterTable
ALTER TABLE "SellerGadget" ADD COLUMN "id" TEXT;
ALTER TABLE "SellerGadget" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SellerGadget" ADD COLUMN "specs" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "SellerGadget" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SellerGadget" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SellerGadget" ADD COLUMN "priceBadge" "PriceBadge" NOT NULL DEFAULT 'NON_NEGOTIABLE';
ALTER TABLE "SellerGadget" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "SellerGadget" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- BackfillPrimaryKey
UPDATE "SellerGadget"
SET "id" = md5(random()::text || clock_timestamp()::text)
WHERE "id" IS NULL;

-- MakePrimaryKeyRequired
ALTER TABLE "SellerGadget" ALTER COLUMN "id" SET NOT NULL;

-- AddPrimaryKey
ALTER TABLE "SellerGadget" ADD CONSTRAINT "SellerGadget_pkey" PRIMARY KEY ("id");

-- Keep direct seller lookup fast
CREATE INDEX "SellerGadget_sellerId_idx" ON "SellerGadget"("sellerId");

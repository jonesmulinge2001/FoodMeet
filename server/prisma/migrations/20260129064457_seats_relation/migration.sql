/*
  Warnings:

  - The values [PREPARING,READY,CANCELLED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tableId` on the `Seat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[restaurantId,seatNumber]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'DELIVERED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_tableId_fkey";

-- DropIndex
DROP INDEX "Seat_tableId_seatNumber_key";

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "tableId",
ADD COLUMN     "restaurantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Seat_restaurantId_seatNumber_key" ON "Seat"("restaurantId", "seatNumber");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

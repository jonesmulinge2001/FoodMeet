/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Seat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tableId,seatNumber]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_restaurantId_fkey";

-- DropIndex
DROP INDEX "Seat_restaurantId_seatNumber_key";

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "restaurantId",
ADD COLUMN     "tableId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Seat_tableId_seatNumber_key" ON "Seat"("tableId", "seatNumber");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

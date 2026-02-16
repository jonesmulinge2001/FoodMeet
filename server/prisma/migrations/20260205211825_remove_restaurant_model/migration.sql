/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Table` table. All the data in the column will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_restaurantId_fkey";

-- DropIndex
DROP INDEX "Table_restaurantId_tableNumber_key";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "restaurantId";

-- DropTable
DROP TABLE "Restaurant";

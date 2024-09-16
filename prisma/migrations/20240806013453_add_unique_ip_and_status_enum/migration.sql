/*
  Warnings:

  - You are about to alter the column `status` on the `IpBackend` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `status` on the `IpFrontend` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `status` on the `IpInternal` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - A unique constraint covering the columns `[ip]` on the table `IpBackend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ip]` on the table `IpFrontend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ip]` on the table `IpInternal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `IpBackend` MODIFY `status` ENUM('AVAILABLE', 'NOT_AVAILABLE') NOT NULL;

-- AlterTable
ALTER TABLE `IpFrontend` MODIFY `status` ENUM('AVAILABLE', 'NOT_AVAILABLE') NOT NULL;

-- AlterTable
ALTER TABLE `IpInternal` MODIFY `status` ENUM('AVAILABLE', 'NOT_AVAILABLE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `IpBackend_ip_key` ON `IpBackend`(`ip`);

-- CreateIndex
CREATE UNIQUE INDEX `IpFrontend_ip_key` ON `IpFrontend`(`ip`);

-- CreateIndex
CREATE UNIQUE INDEX `IpInternal_ip_key` ON `IpInternal`(`ip`);

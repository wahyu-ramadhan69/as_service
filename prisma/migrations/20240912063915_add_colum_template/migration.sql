/*
  Warnings:

  - You are about to alter the column `vmid` on the `templates` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[vmid]` on the table `templates` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `templates` MODIFY `vmid` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `templates_vmid_key` ON `templates`(`vmid`);

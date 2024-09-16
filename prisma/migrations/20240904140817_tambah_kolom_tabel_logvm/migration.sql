/*
  Warnings:

  - Added the required column `vmid` to the `LogVM` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LogVM` ADD COLUMN `tujuan` VARCHAR(191) NULL,
    ADD COLUMN `vmid` INTEGER NOT NULL;

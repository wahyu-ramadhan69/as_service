/*
  Warnings:

  - You are about to drop the column `id_divisi` on the `LogVM` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `LogVM` DROP FOREIGN KEY `LogVM_id_divisi_fkey`;

-- AlterTable
ALTER TABLE `LogVM` DROP COLUMN `id_divisi`;

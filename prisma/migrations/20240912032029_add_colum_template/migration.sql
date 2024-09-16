/*
  Warnings:

  - Added the required column `nama_template` to the `templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `templates` ADD COLUMN `nama_template` VARCHAR(191) NOT NULL,
    ADD COLUMN `tanggal_dibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

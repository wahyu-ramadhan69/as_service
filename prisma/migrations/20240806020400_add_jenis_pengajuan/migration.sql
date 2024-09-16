/*
  Warnings:

  - Added the required column `jenis_pengajuan` to the `Pengajuan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Pengajuan` ADD COLUMN `jenis_pengajuan` ENUM('New', 'Existing') NOT NULL;

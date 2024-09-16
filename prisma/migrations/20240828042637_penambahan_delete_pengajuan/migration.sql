/*
  Warnings:

  - The values [DELETE] on the enum `Pengajuan_jenis_pengajuan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Pengajuan` MODIFY `jenis_pengajuan` ENUM('New', 'Existing', 'Delete') NOT NULL;

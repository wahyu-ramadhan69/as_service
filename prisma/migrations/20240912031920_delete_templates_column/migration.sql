/*
  Warnings:

  - You are about to drop the column `nama_template` on the `templates` table. All the data in the column will be lost.
  - You are about to drop the column `tanggal_dibuat` on the `templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `templates` DROP COLUMN `nama_template`,
    DROP COLUMN `tanggal_dibuat`;

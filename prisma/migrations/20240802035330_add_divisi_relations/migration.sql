/*
  Warnings:

  - Added the required column `id_divisi` to the `Pengajuan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_divisi` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Pengajuan` ADD COLUMN `id_divisi` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Server` ADD COLUMN `id_divisi` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Pengajuan` ADD CONSTRAINT `Pengajuan_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `Divisi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `Divisi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

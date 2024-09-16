/*
  Warnings:

  - Added the required column `id_divisi` to the `LogVM` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Divisi` ADD COLUMN `nama_storage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `LogVM` ADD COLUMN `id_divisi` INTEGER NOT NULL,
    MODIFY `activity` ENUM('PowerOff', 'PowerOn', 'Restart', 'Console', 'IPSync') NOT NULL;

-- AddForeignKey
ALTER TABLE `LogVM` ADD CONSTRAINT `LogVM_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `Divisi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

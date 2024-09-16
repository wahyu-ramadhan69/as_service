/*
  Warnings:

  - Added the required column `id_template` to the `Pengajuan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Pengajuan` ADD COLUMN `id_template` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Pengajuan` ADD CONSTRAINT `Pengajuan_id_template_fkey` FOREIGN KEY (`id_template`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

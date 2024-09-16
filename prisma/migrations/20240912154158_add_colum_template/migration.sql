/*
  Warnings:

  - Added the required column `id_template` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Server` ADD COLUMN `id_template` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_template_fkey` FOREIGN KEY (`id_template`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

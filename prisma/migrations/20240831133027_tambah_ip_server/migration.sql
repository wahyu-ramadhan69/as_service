/*
  Warnings:

  - Added the required column `id_ip` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Server` ADD COLUMN `id_ip` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_ip_fkey` FOREIGN KEY (`id_ip`) REFERENCES `IpAddress`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

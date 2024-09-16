/*
  Warnings:

  - You are about to drop the column `owner` on the `Server` table. All the data in the column will be lost.
  - Added the required column `id_user` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Server` DROP COLUMN `owner`,
    ADD COLUMN `id_user` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

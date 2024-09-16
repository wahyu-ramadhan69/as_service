/*
  Warnings:

  - You are about to alter the column `cpu` on the `Divisi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `storage` on the `Divisi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `ram` on the `Divisi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `cpu` on the `Pengajuan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `ram` on the `Pengajuan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `storage` on the `Pengajuan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `cpu` on the `Server` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `ram` on the `Server` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `storage` on the `Server` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Divisi` MODIFY `cpu` INTEGER NOT NULL,
    MODIFY `storage` INTEGER NOT NULL,
    MODIFY `ram` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pengajuan` MODIFY `cpu` INTEGER NOT NULL,
    MODIFY `ram` INTEGER NOT NULL,
    MODIFY `storage` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Server` MODIFY `cpu` INTEGER NOT NULL,
    MODIFY `ram` INTEGER NOT NULL,
    MODIFY `storage` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Pengajuan` ADD COLUMN `nodes` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Server` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vmid` INTEGER NOT NULL,
    `type_os` VARCHAR(191) NOT NULL,
    `owner` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

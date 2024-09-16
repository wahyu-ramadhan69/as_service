/*
  Warnings:

  - You are about to drop the `IpBackend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IpFrontend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IpInternal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Server` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Server` DROP FOREIGN KEY `Server_id_divisi_fkey`;

-- DropForeignKey
ALTER TABLE `Server` DROP FOREIGN KEY `Server_id_ip_backend_fkey`;

-- DropForeignKey
ALTER TABLE `Server` DROP FOREIGN KEY `Server_id_ip_frontend_fkey`;

-- DropForeignKey
ALTER TABLE `Server` DROP FOREIGN KEY `Server_id_ip_internal_fkey`;

-- DropForeignKey
ALTER TABLE `Server` DROP FOREIGN KEY `Server_id_user_fkey`;

-- DropTable
DROP TABLE `IpBackend`;

-- DropTable
DROP TABLE `IpFrontend`;

-- DropTable
DROP TABLE `IpInternal`;

-- DropTable
DROP TABLE `Server`;

-- CreateTable
CREATE TABLE `IpAddress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NOT NULL,
    `nama_server` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'NOT_AVAILABLE') NOT NULL,
    `type` ENUM('INTERNAL', 'BACKEND', 'FRONTEND') NOT NULL,

    UNIQUE INDEX `IpAddress_ip_key`(`ip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_template` VARCHAR(191) NOT NULL,
    `type_os` VARCHAR(191) NOT NULL,
    `id_vm` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `tanggal_dibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

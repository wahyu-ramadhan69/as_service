-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `id_divisi` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Divisi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `cpu` VARCHAR(191) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `ram` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pengajuan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_os` VARCHAR(191) NOT NULL,
    `cpu` VARCHAR(191) NOT NULL,
    `ram` VARCHAR(191) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `segment` VARCHAR(191) NOT NULL,
    `id_user` INTEGER NOT NULL,
    `status_pengajuan` VARCHAR(191) NOT NULL,
    `nama_aplikasi` VARCHAR(191) NOT NULL,
    `tanggal_pengajuan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_perubahan` DATETIME(3) NOT NULL,
    `tujuan_pengajuan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpInternal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NOT NULL,
    `nama_server` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpBackend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NOT NULL,
    `nama_server` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IpFrontend` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NOT NULL,
    `nama_server` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Server` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_server` VARCHAR(191) NOT NULL,
    `type_os` VARCHAR(191) NOT NULL,
    `cpu` VARCHAR(191) NOT NULL,
    `ram` VARCHAR(191) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `id_ip_internal` INTEGER NULL,
    `id_ip_backend` INTEGER NULL,
    `id_ip_frontend` INTEGER NULL,
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `Divisi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pengajuan` ADD CONSTRAINT `Pengajuan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_ip_internal_fkey` FOREIGN KEY (`id_ip_internal`) REFERENCES `IpInternal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_ip_backend_fkey` FOREIGN KEY (`id_ip_backend`) REFERENCES `IpBackend`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_ip_frontend_fkey` FOREIGN KEY (`id_ip_frontend`) REFERENCES `IpFrontend`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

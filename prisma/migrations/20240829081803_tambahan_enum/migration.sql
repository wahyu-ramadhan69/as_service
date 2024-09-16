-- AlterTable
ALTER TABLE `Pengajuan` MODIFY `jenis_pengajuan` ENUM('New', 'Existing', 'Delete', 'Perubahan') NOT NULL;

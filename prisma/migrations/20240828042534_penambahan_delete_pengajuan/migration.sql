-- AlterTable
ALTER TABLE `Pengajuan` MODIFY `jenis_pengajuan` ENUM('New', 'Existing', 'DELETE') NOT NULL;

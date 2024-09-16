/*
  Warnings:

  - Added the required column `vmid` to the `templates` table without a default value. This is not possible if the table is not empty.
  - Made the column `nodes` on table `templates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `templates` ADD COLUMN `vmid` VARCHAR(191) NOT NULL,
    MODIFY `nodes` VARCHAR(191) NOT NULL;

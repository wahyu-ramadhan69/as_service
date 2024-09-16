/*
  Warnings:

  - A unique constraint covering the columns `[vmid]` on the table `Server` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Server_vmid_key` ON `Server`(`vmid`);

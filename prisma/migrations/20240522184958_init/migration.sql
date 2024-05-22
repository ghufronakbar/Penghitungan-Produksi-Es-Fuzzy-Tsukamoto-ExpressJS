-- CreateTable
CREATE TABLE `Users` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `fullname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Calculates` (
    `id_calculate` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `persediaan` INTEGER NOT NULL,
    `permintaan` INTEGER NOT NULL,
    `produksi` INTEGER NOT NULL,
    `derajat_keanggotaan_persediaan` INTEGER NOT NULL,
    `derajat_keanggotaan_permintaan` INTEGER NOT NULL,
    `derajat_keanggotaan_produksi` INTEGER NOT NULL,
    `r1_derajat_persediaan` INTEGER NOT NULL,
    `r1_derajat_permintaan` INTEGER NOT NULL,
    `r1_alpha` INTEGER NOT NULL,
    `r1_zi` INTEGER NOT NULL,
    `r1_aixzi` INTEGER NOT NULL,
    `r2_derajat_persediaan` INTEGER NOT NULL,
    `r2_derajat_permintaan` INTEGER NOT NULL,
    `r2_alpha` INTEGER NOT NULL,
    `r2_zi` INTEGER NOT NULL,
    `r2_aixzi` INTEGER NOT NULL,
    `r3_derajat_persediaan` INTEGER NOT NULL,
    `r3_derajat_permintaan` INTEGER NOT NULL,
    `r3_alpha` INTEGER NOT NULL,
    `r3_zi` INTEGER NOT NULL,
    `r3_aixzi` INTEGER NOT NULL,
    `r4_derajat_persediaan` INTEGER NOT NULL,
    `r4_derajat_permintaan` INTEGER NOT NULL,
    `r4_alpha` INTEGER NOT NULL,
    `r4_zi` INTEGER NOT NULL,
    `r4_aixzi` INTEGER NOT NULL,
    `produksi_es_batu` INTEGER NOT NULL,
    `datetime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Calculates_id_user_idx`(`id_user`),
    PRIMARY KEY (`id_calculate`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Akses_Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `ip_address` VARCHAR(255) NOT NULL,
    `token` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Calculates` ADD CONSTRAINT `Calculates_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

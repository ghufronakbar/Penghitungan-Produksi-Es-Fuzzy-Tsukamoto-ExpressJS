const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const config = require('../config/secret'); // Pastikan Anda telah mengatur konfigurasi token

const prisma = new PrismaClient();

const userVerification = async (req, res, next) => {
  // Ambil token dari header Authorization
  let token = req.headers["authorization"];

  if (token) {
    // Remove 'Bearer ' jika ada
    token = token.replace(/^Bearer\s+/, "");

    // Verifikasi token
    jwt.verify(token, config.secret, async function (error, decoded) {
      if (error) {
        return res.status(401).send({ auth: false, message: "Token tidak terdaftar!" });
      } else {
        // Cek waktu kadaluarsa token
        const currentTime = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik
        if (decoded.exp && decoded.exp < currentTime) {
          return res.status(401).send({ auth: false, message: "Token telah kadaluarsa!" });
        }

        try {
          // Periksa apakah token ada di tabel akses_token
          const tokenData = await prisma.akses_Token.findFirst({
            where: { id_user: decoded.id_user }
          });

          if (!tokenData) {
            return res.status(401).send({ auth: false, message: "There's no token exist" });
          }

          // Jika id_user tidak ada dalam decoded dan dilakukan select ke tabel users
          if (!decoded.id_user) {
            return res.status(401).send({ auth: false, message: "You are not user" });
          }

          // Simpan data decoded ke dalam req untuk penggunaan selanjutnya
          req.decoded = decoded;
          next(); // Lanjutkan ke middleware/route selanjutnya
        } catch (error) {
          console.error(error);
          return res.status(500).send({ auth: false, message: "Internal Server Error" });
        }
      }
    });
  } else {
    return res.status(401).send({ auth: false, message: "Token tidak tersedia!" });
  }
};

module.exports = userVerification;

const jwt = require("jsonwebtoken");
const config = require("../config/secret");

function verifikasi(token) {
  return function (req, res, next) {
    // Cek Authorization
    if (token) {
      console.log("cek", token);
      var cekToken = token;
      // Verifikasi
      jwt.verify(cekToken, config.secret, function (err, decoded) {
        if (err) {
          return res
            .status(401)
            .send({ auth: false, message: "Token tidak terdaftar!" });
        } else {
          console.log(decoded);
          req.decoded = decoded; // Menyimpan data decoded ke dalam req untuk penggunaan selanjutnya
          next(); // Lanjutkan ke middleware/route selanjutnya
        }
      });
    } else {
      return res
        .status(401)
        .send({ auth: false, message: "Token tidak tersedia!" });
    }
  };
}

module.exports = verifikasi;

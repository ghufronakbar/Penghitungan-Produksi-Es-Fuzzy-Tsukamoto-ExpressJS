'use strict';

const connection = require('../../connection');

exports.calculate = async (req, res) => {
  const { persediaan, permintaan } = req.body;
  const id_user = req.decoded.id_user;
  const nowDate = new Date();

  if (persediaan < 0 || permintaan < 0) {
    return res.status(400).json({ status: 400, message: "Data tidak valid. Pastikan data berada dalam rentang yang ditentukan!" });
  }

  let persediaansedikit, persediaanbanyak;
  let permintaansedikit, permintaanbanyak;

  // Persediaan sedikit
  if (persediaan <= 300) {
    persediaansedikit = 1;
  } else if (persediaan > 300 && persediaan < 400) {
    persediaansedikit = (400 - persediaan) / (400 - 300);
  } else {
    persediaansedikit = 0;
  }

  // Persediaan banyak
  if (persediaan <= 300) {
    persediaanbanyak = 0;
  } else if (persediaan > 300 && persediaan < 400) {
    persediaanbanyak = (persediaan - 300) / (400 - 300);
  } else {
    persediaanbanyak = 1;
  }

  // Permintaan sedikit
  if (permintaan <= 350) {
    permintaansedikit = 1;
  } else if (permintaan > 350 && permintaan < 500) {
    permintaansedikit = (500 - permintaan) / (500 - 350);
  } else {
    permintaansedikit = 0;
  }

  // Permintaan banyak
  if (permintaan <= 350) {
    permintaanbanyak = 0;
  } else if (permintaan > 350 && permintaan < 500) {
    permintaanbanyak = (permintaan - 350) / (500 - 350);
  } else {
    permintaanbanyak = 1;
  }

  // Rule calculations
  const a1 = Math.min(persediaansedikit, permintaansedikit);
  const z1 = 450 - (a1 * 150);

  const a2 = Math.min(persediaansedikit, permintaanbanyak);
  const z2 = 300 + (a2 * 150);

  const a3 = Math.min(persediaanbanyak, permintaansedikit);
  const z3 = 450 - (a3 * 150);

  const a4 = Math.min(persediaanbanyak, permintaanbanyak);
  const z4 = 300 + (a4 * 150);

  const total_AiZi = (a1 * z1) + (a2 * z2) + (a3 * z3) + (a4 * z4);
  const total_a = a1 + a2 + a3 + a4;
  const produksi = total_AiZi / total_a;

  let produksisedikit, produksibanyak;

  // Produksi sedikit
  if (produksi <= 300) {
    produksisedikit = 1;
  } else if (produksi > 300 && produksi < 450) {
    produksisedikit = (450 - produksi) / (450 - 300);
  } else {
    produksisedikit = 0;
  }

  // Produksi banyak
  if (produksi <= 300) {
    produksibanyak = 0;
  } else if (produksi > 300 && produksi < 450) {
    produksibanyak = (produksi - 300) / (450 - 300);
  } else {
    produksibanyak = 1;
  }

  // Insert into database
  const query = `
    INSERT INTO calculates (
      id_user, persediaan, permintaan, produksi, 
      derajat_keanggotaan_persediaan, derajat_keanggotaan_permintaan, derajat_keanggotaan_produksi, 
      r1_derajat_persediaan, r1_derajat_permintaan, r1_alpha, r1_zi, r1_aixzi, 
      r2_derajat_persediaan, r2_derajat_permintaan, r2_alpha, r2_zi, r2_aixzi, 
      r3_derajat_persediaan, r3_derajat_permintaan, r3_alpha, r3_zi, r3_aixzi, 
      r4_derajat_persediaan, r4_derajat_permintaan, r4_alpha, r4_zi, r4_aixzi, 
      produksi_es_batu, datetime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id_user, persediaan, permintaan, produksi,
    persediaansedikit, permintaansedikit, produksisedikit,
    persediaansedikit, permintaansedikit, a1, z1, a1 * z1,
    persediaansedikit, permintaanbanyak, a2, z2, a2 * z2,
    persediaanbanyak, permintaansedikit, a3, z3, a3 * z3,
    persediaanbanyak, permintaanbanyak, a4, z4, a4 * z4,
    produksi, nowDate
  ];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }

    return res.status(200).json({
      status: 200,
      message: "Calculation successful",
      data: {
        id_user,
        persediaan: parseInt(persediaan),
        permintaan: parseInt(permintaan),
        produksi,
        derajat_keanggotaan_persediaan: persediaansedikit,
        derajat_keanggotaan_permintaan: permintaansedikit,
        derajat_keanggotaan_produksi: produksisedikit,
        r1_derajat_persediaan: persediaansedikit,
        r1_derajat_permintaan: permintaansedikit,
        r1_alpha: a1,
        r1_zi: z1,
        r1_aixzi: a1 * z1,
        r2_derajat_persediaan: persediaansedikit,
        r2_derajat_permintaan: permintaanbanyak,
        r2_alpha: a2,
        r2_zi: z2,
        r2_aixzi: a2 * z2,
        r3_derajat_persediaan: persediaanbanyak,
        r3_derajat_permintaan: permintaansedikit,
        r3_alpha: a3,
        r3_zi: z3,
        r3_aixzi: a3 * z3,
        r4_derajat_persediaan: persediaanbanyak,
        r4_derajat_permintaan: permintaanbanyak,
        r4_alpha: a4,
        r4_zi: z4,
        r4_aixzi: a4 * z4,
        produksi_es_batu: produksi,
        date_time: nowDate
      }
    });
  });
};

exports.historyCalculate = async (req, res) => {
  const id_user = req.decoded.id_user
  const query = `SELECT * FROM calculates WHERE id_user=?`
  connection.query(query, id_user,
    (error, rows) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        return res.status(200).json({ status: 200, rows });
      }
    }
  )
}

exports.historyCalculateId = async (req, res) => {
  const id_user = req.decoded.id_user
  const id_calculate = req.params.id_calculate
  const query = `SELECT * FROM calculates WHERE id_user=? AND id_calculate=?`
  connection.query(query, [id_user, id_calculate],
    (error, rows) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        return res.status(200).json({ status: 200, rows });
      }
    }
  )
}

exports.historyDelete = async (req, res) => {
  const id_user = req.decoded.id_user
  const id_calculate = req.params.id_calculate
  const query = `DELETE FROM calculates WHERE id_user=? and id_calculate=?`
  connection.query(query, [id_user, id_calculate],
    (error, rows) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
      } else {
        return res.status(200).json({ status: 200, message: "Successfully delete history" });
      }
    }
  )
}
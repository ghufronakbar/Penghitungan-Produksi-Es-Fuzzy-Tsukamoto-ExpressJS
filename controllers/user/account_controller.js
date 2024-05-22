'use strict';

const connection = require('../../connection');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../../config/secret');
const ip = require('ip');

// LOGIN
exports.login = function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ status: 400, message: "Email and password are required" });
  }

  const query = "SELECT email, id_user FROM users WHERE password=? AND email=?";
  const values = [md5(password), email];

  connection.query(query, values, function (error, rows) {
    if (error) {
      console.error(error);

      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (rows.length === 1) {
      const id_user = rows[0].id_user;
      const token = jwt.sign({ id_user }, config.secret, { expiresIn: 1440 * 4 });
      const data = { id_user, token, ip_address: ip.address() };

      const insertQuery = "INSERT INTO akses_token SET ?";

      connection.query(insertQuery, data, function (insertError) {
        if (insertError) {
          console.error(insertError);
          return res.status(500).json({ success: false, message: "Internal server error" });
        }

        res.json({
          success: true,
          message: "Token JWT Generated!",
          token: token,
          currUser: id_user
        });
      });
    } else {
      return res.json({ status: 403, message: "Invalid Email or password" });
    }
  });
};

exports.register = async (req, res) => {
  const { fullname, email, password, confirmation_password } = req.body

  if (!fullname || !email || !password || !confirmation_password) {
    return res.status(400).json({ status: 400, message: "Field can't blank" });
  } else {
    connection.query(`SELECT * FROM users WHERE email=?`, [email],
      function (error, rows, result) {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          const uniqueEmail = rows.length
          if (uniqueEmail) {
            return res.status(401).json({ status: 401, message: `Email ${email} already exist` });
          } else {
            if (password != confirmation_password) {
              return res.status(402).json({ status: 402, message: "Confirmation password doesn't match" });
            } else {
              const qRegiter = `INSERT INTO users(fullname,email,password) VALUES(?,?,?)`
              const vRegister = [fullname, email, md5(password)]
              connection.query(qRegiter, vRegister,
                function (error, rows, result) {
                  if (error) {
                    console.log(error);
                    return res.status(500).json({ status: 500, message: "Internal Server Error" });
                  } else {
                    return res.status(200).json({ status: 200, message: "Register Successfully" });
                  }
                }
              )
            }
          }
        }
      }
    )
  }
}



exports.profile = function (req, res) {
  const id_user = req.decoded.id_user
  connection.query(`SELECT * FROM users WHERE id_user=?`, id_user,
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        res.json({ status: 200, rows })
      }
    });
};

exports.editProfile = function (req, res) {
  const id_user = req.decoded.id_user;
  const { fullname, email } = req.body

  if (!fullname || !email) {
    return res.status(400).json({ status: 400, message: "Field can't blank" });
  } else {
    connection.query(`SELECT email FROM users WHERE id_user=?`, id_user,
      function (error, r, result) {
        if (error) {
          console.log(error);
          return res.status(500).json({ status: 500, message: "Internal Server Error" });
        } else {
          const currentEmail = r[0].email
          if (email == currentEmail) {
            const qEditProfile = `UPDATE users SET fullname=? WHERE id_user=?`
            const vEditProfile = [fullname, id_user]
            connection.query(qEditProfile, vEditProfile,
              function (error, rows, result) {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                  return res.status(200).json({ status: 200, message: `Update profile successfully email not changed` });
                }
              }
            )
          } else {
            connection.query(`SELECT * FROM users WHERE email=? AND NOT email=?`, [email, currentEmail],
              function (error, rows, result) {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ status: 500, message: "Internal Server Error" });
                } else {
                  const uniqueEmail = rows.length
                  if (uniqueEmail) {
                    return res.status(401).json({ status: 401, message: `Email ${email} already exist` });
                  } else {
                    const qEditProfile = `UPDATE users SET fullname=?, email=? WHERE id_user=?`
                    const vEditProfile = [fullname, email, id_user]
                    connection.query(qEditProfile, vEditProfile,
                      function (error, rows, result) {
                        if (error) {
                          console.log(error);
                          return res.status(500).json({ status: 500, message: "Internal Server Error" });
                        } else {
                          return res.status(200).json({ status: 200, message: `Update profile successfully` });
                        }
                      }
                    )
                  }
                }
              }
            )
          }

        }
      }
    )
  }
};


//Post password Users match
exports.editPassword = function (req, res) {
  const { old_password, password: new_password } = req.body;
  const id_user = req.decoded.id_user;

  if (!old_password || !new_password) {
    return res.status(400).json({ status: 400, message: "Old password and new password are required" });
  }

  connection.query(
    'SELECT password FROM users WHERE id_user = ?',
    [id_user],
    function (error, rows) {
      if (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ status: 404, message: "User not found" });
      }

      const validation_password = rows[0].password;
      if (md5(old_password) !== validation_password) {
        return res.status(400).json({ status: 400, message: "Incorrect old password" });
      }

      connection.query(
        'UPDATE users SET password = ? WHERE id_user = ?',
        [md5(new_password), id_user],
        function (error) {
          if (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: "Internal Server Error" });
          }

          return res.status(200).json({ status: 200, message: "Change password successfully" });
        }
      );
    }
  );
};

'use strict';

const md5 = require('md5');
const jwt = require('jsonwebtoken');
const config = require('../../config/secret');
const ip = require('ip');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 400, message: "Email and password are required" });
  }

  try {
    // Cari pengguna berdasarkan email
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      }
    });

    if (!user || user.password !== md5(password)) {
      return res.status(403).json({ status: 403, message: "Invalid Email or password" });
    }

    const id_user = user.id_user;
    const token = jwt.sign({ id_user }, config.secret, { expiresIn: 1440 * 4 });

    const data = {
      id_user,
      ip_address: ip.address(),
      token
    };

    // Masukkan token akses ke dalam database
    await prisma.akses_Token.create({
      data: data
    });

    return res.json({
      success: true,
      message: "Token JWT Generated!",
      token: token,
      currUser: id_user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//REGISTER USER
exports.register = async (req, res) => {
  const { fullname, email, password, confirmation_password } = req.body;

  if (!fullname || !email || !password || !confirmation_password) {
    return res.status(400).json({ status: 400, message: "Field can't blank" });
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(401).json({ status: 401, message: `Email ${email} already exists` });
    }

    if (password !== confirmation_password) {
      return res.status(402).json({ status: 402, message: "Confirmation password doesn't match" });
    }

    await prisma.users.create({
      data: {
        fullname,
        email,
        password: md5(password)
      }
    });

    return res.status(200).json({ status: 200, message: "Register Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};


// PROFILE USER
exports.profile = async (req, res) => {
  const id_user = req.decoded.id_user;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      }
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    return res.status(200).json({ status: 200, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// EDIT PROFILE
exports.editProfile = async (req, res) => {
  const id_user = req.decoded.id_user;
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    return res.status(400).json({ status: 400, message: "Field can't be blank" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      },
      select: {
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const currentEmail = user.email;

    if (email === currentEmail) {
      await prisma.users.update({
        where: {
          id_user: id_user,
        },
        data: {
          fullname: fullname,
        },
      });

      return res.status(200).json({ status: 200, message: "Update profile successfully, email not changed" });
    } else {
      const emailExists = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (emailExists) {
        return res.status(401).json({ status: 401, message: `Email ${email} already exists` });
      } else {
        await prisma.users.update({
          where: {
            id_user: id_user,
          },
          data: {
            fullname: fullname,
            email: email,
          },
        });

        return res.status(200).json({ status: 200, message: "Update profile successfully" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};



//EDIT PASSWORD
exports.editPassword = async (req, res) => {
  const { old_password, password: new_password } = req.body;
  const id_user = req.decoded.id_user;

  if (!old_password || !new_password) {
    return res.status(400).json({ status: 400, message: "Old password and new password are required" });
  }

  try {
    // Mengambil password user dari database
    const user = await prisma.users.findUnique({
      where: { id_user: id_user },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Validasi password lama
    if (md5(old_password) !== user.password) {
      return res.status(400).json({ status: 400, message: "Incorrect old password" });
    }

    // Update password dengan password baru
    await prisma.users.update({
      where: { id_user: id_user },
      data: { password: md5(new_password) },
    });

    return res.status(200).json({ status: 200, message: "Change password successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

"use strict";

const verifikasiUser = require("../middleware/verifikasi-user");

module.exports = function (app) {
  let userController = require("../controllers/user");

  // ACCOUNT CONTROLLER
  app.route(`/api/user/register`)
    .post(userController.account_controller.register);

  app.route(`/api/user/login`)
    .post(userController.account_controller.login);

  app.route('/api/user/profile')
    .get(verifikasiUser, userController.account_controller.profile);

  app.route('/api/user/profile/edit')
    .put(verifikasiUser, userController.account_controller.editProfile);

  app.route('/api/user/profile/password')
    .put(verifikasiUser, userController.account_controller.editPassword);


  //CALCULATE CONTROLLER
  app.route(`/api/user/calculate`)
    .post(verifikasiUser, userController.calculate_controller.calculate);

  app.route(`/api/user/calculate/history`)
    .get(verifikasiUser, userController.calculate_controller.historyCalculate);

  app.route(`/api/user/calculate/history/:id_calculate`)
    .get(verifikasiUser, userController.calculate_controller.historyCalculateId);

};


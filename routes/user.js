"use strict";

const userVerification = require("../middleware/user_verification");
const userController = require("../controllers/user");

module.exports = async (app) => {

  // ACCOUNT CONTROLLER
  app.route(`/api/user/register`)
    .post(userController.accountController.register);

  app.route(`/api/user/login`)
    .post(userController.accountController.login);

  app.route('/api/user/profile')
    .get(userVerification, userController.accountController.profile);

  app.route('/api/user/profile/edit')
    .put(userVerification, userController.accountController.editProfile);

  app.route('/api/user/profile/password')
    .put(userVerification, userController.accountController.editPassword);


  //CALCULATE CONTROLLER
  app.route(`/api/user/calculate`)
    .post(userVerification, userController.calculateController.calculate);

  app.route(`/api/user/calculate/history`)
    .get(userVerification, userController.calculateController.historyCalculate);

  app.route(`/api/user/calculate/history/:id_calculate`)
    .get(userVerification, userController.calculateController.historyCalculateId);

  app.route(`/api/user/calculate/history/delete/:id_calculate`)
    .delete(userVerification, userController.calculateController.historyDelete);

};


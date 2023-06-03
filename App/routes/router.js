"use strict";
module.exports = function (app) {
  var controller_login = require("../controllers/login");
  var controller_user = require("../controllers/user");

  ////////////////controller_login//////////////////////
  //ورود

  app.route("/add_register_user").post(controller_login.add_register_user);

  app.route("/register_login").post(controller_login.register_login);

  app.route("/login").post(controller_login.login);

  app.route("/user").get(controller_login.user);

  app.route("/refresh_token_user").post(controller_login.refresh_token_user);

  app.route("/Logout").post(controller_login.Logout);

  ////////////////controller_user//////////////////////
  //ثبت کاربر(کارمند و شغل و مشتری)
  app.route("/add_user").post(controller_user.add_user);

  app.route("/edit_user").post(controller_user.edit_user);

  app.route("/identity_customer").post(controller_user.identity_customer);

  app.route("/forget_password").post(controller_user.forget_password);
};

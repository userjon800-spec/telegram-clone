const BaseError = require("../errors/base.error");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
module.exports = async function (req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return next(BaseError.Unauthorized());
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(BaseError.Unauthorized());
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return next(BaseError.Unauthorized());
    }
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(BaseError.Unauthorized());
    }
    req.user = user;
    next();
  } catch (error) {
    return next(BaseError.Unauthorized());
  }
};
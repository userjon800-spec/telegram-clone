const BaseError = require("../errors/base.error");
const { CONST } = require("../lib/constants");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const mailService = require("../service/mail.service");
class UserController {
  // GET
  async getContacts(req, res, next) {
    try {
      const user = "696c96bf4ce381f9c4a0486e";
      const { contactId } = req.params;
      const messages = await messageModel
        .find({
          $or: [
            { sender: user, receiver: contactId },
            { sender: contactId, receiver: user },
          ],
        })
        .populate({
          path: "sender",
          select: "email",
        })
        .populate({
          path: "receiver",
          select: "email",
        });
      await messageModel.updateMany(
        { sender: contactId, receiver: user, status: "SENT" },
        { status: CONST.READ },
      );
      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }
  async getMessages(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  // POST
  async createMessage(req, res, next) {
    try {
      const newMessage = await messageModel.create(req.body);
      const currentMessage = await messageModel
        .findById(newMessage.id) // id topadi jo'natuvchi id'sini
        .populate({
          path: "sender",
          select: "email",
        }) // bu esa populate user bizga to'liq yoyib beradi ya'ni uni to'liq ko'rsatadi
        .populate({
          path: "receiver",
          select: "email",
        }); // bu yerda yoyilgan object ichidan kerakli key va value larni olyabmiz masalan so'rov yuborganimizda faat email o'zi keladi
      res.status(201).json({ newMessage: currentMessage });
    } catch (error) {
      next(error);
    }
  }
  async messageRead(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async createContact(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async createReaction(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async sendOtp(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  // [PUT]
  async updateProfile(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async updateMessage(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async updateEmail(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  // [DELETE]
  async deleteUser(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
  async deleteMessage(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new UserController();
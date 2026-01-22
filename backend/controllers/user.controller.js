const BaseError = require("../errors/base.error");
const { CONST } = require("../lib/constants");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const mailService = require("../service/mail.service");
class UserController {
  // GET
  async getContacts(req, res, next) {
    try {
      const userId = "696c90a60e8e764fb8339de7";
      const contacts = await userModel.findById(userId).populate("contacts");
      const allContacts = contacts.contacts.map((contact) =>
        contact.toObject(),
      );
      for (const contact of allContacts) {
        const lastMessages = await messageModel
          .findOne({
            $or: [
              { sender: userId, receiver: contact._id },
              { sender: contact._id, receiver: userId },
            ],
          })
          .populate({ path: "sender" })
          .populate({ path: "receiver" })
          .sort({ createdAt: -1 });
        contact.lastMessages = lastMessages;
      }
      return res.status(200).json({ contacts: allContacts });
    } catch (error) {
      next(error);
    }
  }
  async getMessages(req, res, next) {
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
      const { messages } = req.body;
      const allMessages = [];
      for (const message of messages) {
        const updateMessage = await messageModel.findByIdAndUpdate(
          message._id,
          { status: CONST.READ },
          { new: true },
        );
        allMessages.push(updateMessage);
      }
      res.status(200).json({ messages: allMessages });
    } catch (error) {
      next(error);
    }
  }
  async createContact(req, res, next) {
    try {
      const { email } = req.body;
      const userId = "696c90a60e8e764fb8339de7";
      const user = await userModel.findById(userId);
      const contact = await userModel.findOne({ email });
      if (!contact)
        throw BaseError.BadRequest("User with this email does not exist");
      if (user.email === contact.email)
        throw BaseError.BadRequest("You can add yourself as a contact");
      const existingContact = await userModel.findOne({
        _id: userId,
        contacts: contact._id,
      });
      if (existingContact) throw BaseError.BadRequest("Contact already exists");
      await userModel.findByIdAndUpdate(userId, {
        $push: { contacts: contact._id },
      });
      const addedContact = await userModel.findByIdAndUpdate(
        contact._id,
        {
          $push: { contacts: userId },
        },
        { new: true }, // agar bu parametrni qo'shmasak qo'shilgan contact bizga ko'rinmaydi
      );
      return res
        .status(201)
        .json({ message: "Contact added succesfully", contact: addedContact });
    } catch (error) {
      next(error);
    }
  }
  async createReaction(req, res, next) {
    try {
      const { messageId, reaction } = req.body;
      const updateMessage = await messageModel.findByIdAndUpdate(
        messageId,
        { reaction },
        { new: true },
      );
      res.status(200).json({ updateMessage });
    } catch (error) {
      next(error);
    }
  }
  async sendOtp(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await userModel.findOne({ email });
      if (existingUser)
        throw BaseError.BadRequest("User with this email doest not exist");
      await mailService.sendOtp(email);
      res.status(200).json({ email });
    } catch (error) {
      next(error);
    }
  }
  // [PUT]
  async updateProfile(req, res, next) {
    try {
      const user = req.user;
      await userModel.findByIdAndUpdate(user._id, req.body);
      res.status(200).json({ message: "Profile updated succesfully" });
    } catch (error) {
      next(error);
    }
  }
  async updateMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      const updateMessage = await messageModel.findByIdAndUpdate(
        messageId,
        { text },
        { new: true },
      );
      res.status(200).json({ updateMessage });
    } catch (error) {
      next(error);
    }
  }
  async updateEmail(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await mailService.verifyOtp(email, otp);
      if (result) {
        const userId = req.user._id
        const user = await userModel.findByIdAndUpdate(
          userId,
          { email },
          { new: true },
        );
        res.status(200).json({ user });
      }
    } catch (error) {
      next(error);
    }
  }
  // [DELETE]
  async deleteUser(req, res, next) {
    try {
      const userId = req.user._id;
      await userModel.findByIdAndDelete(userId);
      res.status(200).json({ message: "User deleted succesfully" });
    } catch (error) {
      next(error);
    }
  }
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      await messageModel.findByIdAndDelete(messageId);
      res.status(200).json({ message: "Message deleted succesfully" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new UserController();
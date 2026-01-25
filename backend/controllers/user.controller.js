const BaseError = require("../errors/base.error");
const { CONST } = require("../lib/constants");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const mailService = require("../service/mail.service");
class UserController {
  // GET
  async getContacts(req, res, next) {
    try {
      const userId = req.user._id;
      const user = await userModel.findById(userId).populate("contacts");
      if (!user) throw BaseError.BadRequest("User not found");
      const allContacts = user.contacts.map((contact) => contact.toObject());
      for (const contact of allContacts) {
        const lastMessage = await messageModel
          .findOne({
            $or: [
              { sender: userId, receiver: contact._id },
              { sender: contact._id, receiver: userId },
            ],
          })
          .populate("sender", "email")
          .populate("receiver", "email")
          .sort({ createdAt: -1 });
        contact.lastMessages = lastMessage || null;
      }
      res.status(200).json({ contacts: allContacts });
    } catch (error) {
      next(error);
    }
  }
  async getMessages(req, res, next) {
    try {
      const userId = req.user._id;
      const { contactId } = req.params;
      const messages = await messageModel
        .find({
          $or: [
            { sender: userId, receiver: contactId },
            { sender: contactId, receiver: userId },
          ],
        })
        .populate("sender", "email")
        .populate("receiver", "email");

      await messageModel.updateMany(
        { sender: contactId, receiver: userId, status: CONST.SENT },
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
      const { receiver, text } = req.body;
      const newMessage = await messageModel.create({
        sender: req.user._id,
        receiver,
        text,
      });
      const currentMessage = await messageModel
        .findById(newMessage._id)
        .populate("sender", "email")
        .populate("receiver", "email");

      res.status(201).json({ newMessage: currentMessage });
    } catch (error) {
      next(error);
    }
  }
  async messageRead(req, res, next) {
    try {
      const { messages } = req.body;
      const allMessages = await Promise.all(
        messages.map(async (msg) =>
          messageModel.findByIdAndUpdate(
            msg._id,
            { status: CONST.READ },
            { new: true },
          ),
        ),
      );
      res.status(200).json({ messages: allMessages });
    } catch (error) {
      next(error);
    }
  }
  async createContact(req, res, next) {
    try {
      const { email } = req.body;
      const userId = req.user._id;
      const user = await userModel.findById(userId);
      const contact = await userModel.findOne({ email });
      if (!contact)
        throw BaseError.BadRequest("User with this email does not exist");
      if (contact._id.equals(user._id))
        throw BaseError.BadRequest("You cannot add yourself as a contact");
      const isAlreadyContact = user.contacts.some((c) => c.equals(contact._id));
      if (isAlreadyContact)
        throw BaseError.BadRequest("Contact already exists");
      await userModel.findByIdAndUpdate(userId, {
        $push: { contacts: contact._id },
      });
      const addedContact = await userModel.findByIdAndUpdate(
        contact._id,
        { $push: { contacts: userId } },
        { new: true },
      );
      res
        .status(201)
        .json({ contact: addedContact });
    } catch (error) {
      next(error);
    }
  }
  async createReaction(req, res, next) {
    try {
      const { messageId, reaction } = req.body;
      const updatedMessage = await messageModel.findByIdAndUpdate(
        messageId,
        { reaction },
        { new: true },
      );
      res.status(200).json({ updateMessage: updatedMessage });
    } catch (error) {
      next(error);
    }
  }
  async sendOtp(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        throw BaseError.BadRequest("Email already in use");
      }
      await mailService.sendOtp(email);
      res.status(200).json({ email });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      next(error);
    }
  }
  // [PUT]
  async updateProfile(req, res, next) {
    try {
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        req.body,
        {
          new: true,
        },
      );
      res
        .status(200)
        .json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
  async updateMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      const updatedMessage = await messageModel.findByIdAndUpdate(
        messageId,
        { text },
        { new: true },
      );
      res.status(200).json({ updateMessage: updatedMessage });
    } catch (error) {
      next(error);
    }
  }
  async updateEmail(req, res, next) {
    try {
      const { email, otp } = req.body;
      const isOtpValid = await mailService.verifyOtp(email, otp);
      if (!isOtpValid) {
        throw BaseError.BadRequest("Invalid OTP");
      }
      const emailExists = await userModel.findOne({ email, _id: { $ne: req.user._id }, });
      if (emailExists) {
        throw BaseError.BadRequest("Email already in use");
      }
      const user = await userModel.findByIdAndUpdate(
        req.user._id,
        { email },
        { new: true },
      );
      res.status(200).json({ user });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already in use" });
      }
      next(error);
    }
  }
  // [DELETE]
  async deleteUser(req, res, next) {
    try {
      await userModel.findByIdAndDelete(req.user._id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const deletedMessage = await messageModel.findOneAndDelete({
        _id: messageId,
        sender: req.user._id,
      });
      if (!deletedMessage) throw BaseError.Unauthorized();
      res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new UserController();
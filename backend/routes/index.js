const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const router = require("express").Router();
// get
router.get("/user/messages/:contactId", userController.getMessages);
router.get("/user/contacts", userController.getContacts);
// post
router.post("/auth/login", authController.login);
router.post("/auth/verify", authController.verify);
router.post("/user/message", userController.createMessage);
router.post("/user/contact", userController.createContact);
router.post("/user/reaction", userController.createReaction);
router.post("/user/send-otp", userController.sendOtp);
router.post("/user/message-read", userController.messageRead);
// put
router.put("/user/profile", userController.updateProfile);
router.put("/user/message/:messageId", userController.updateMessage);
router.put("/user/email", userController.updateEmail);
// delete
router.delete("/user/message/:messageId", userController.deleteMessage);
router.delete("/user/user", userController.deleteUser);
module.exports = router;
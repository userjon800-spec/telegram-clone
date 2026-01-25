const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = require("express").Router();
// get
router.get(
  "/user/messages/:contactId",
  authMiddleware,
  userController.getMessages,
);
router.get("/user/contacts", authMiddleware, userController.getContacts);
// post
router.post("/auth/login", authController.login);
router.post("/auth/verify", authController.verify);
router.post("/user/message", authMiddleware, userController.createMessage);
router.post("/user/contact", authMiddleware, userController.createContact);
router.post("/user/reaction", authMiddleware, userController.createReaction);
router.post(
  "/user/send-otp",
  authMiddleware,
  userController.sendOtp,
);
router.post("/user/message-read", authMiddleware, userController.messageRead);
// put
router.put("/user/profile", authMiddleware, userController.updateProfile);
router.put(
  "/user/message/:messageId",
  authMiddleware,
  userController.updateMessage,
);
router.put("/user/email", authMiddleware, userController.updateEmail);
// delete
router.delete(
  "/user/message/:messageId",
  authMiddleware,
  userController.deleteMessage,
);
router.delete("/user/user", authMiddleware, userController.deleteUser);
module.exports = router;
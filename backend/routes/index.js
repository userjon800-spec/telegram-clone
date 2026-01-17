const authController = require("../controllers/auth.controller")
const router = require("express").Router()
router.post("/auth/login", authController.login)
router.post("/auth/verify", authController.verify)
router.get("/user/contacts", (req,res)=>{
    res.json({contacts: []})
})
module.exports = router
class AuthController {
  async login(req, res) {
    const { email } = req.body;
    res.json({ email });
  }
  async verify(req, res) {
    const { email, otp } = req.body;
    res.json({ email, otp });
  }
}
module.exports = new AuthController();
class HealthController {
  static root(req, res) {
    res.json({ message: 'Hello from orchestr-101' });
  }

  static health(req, res) {
    res.json({ status: 'ok' });
  }
}

module.exports = { HealthController };

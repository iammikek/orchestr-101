const API_KEY = process.env.API_KEY || 'dev-key-123';

/**
 * Middleware: verify X-API-Key header (Laravel-style auth middleware).
 * Returns 401 if missing or invalid.
 */
function verifyApiKey(req, res, next) {
  const key = req.header('x-api-key') || req.header('X-API-Key');
  if (!key || key !== API_KEY) {
    res.status(401).json({ detail: 'Invalid or missing API key' });
    return;
  }
  next();
}

module.exports = { verifyApiKey };

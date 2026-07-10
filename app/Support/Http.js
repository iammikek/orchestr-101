function isShopRequest(path) {
  return path.startsWith('/shop');
}

function errorJson(res, detail, status, code = null, extraHeaders = {}) {
  const payload = { detail };
  if (code != null) payload.code = code;
  if (Object.keys(extraHeaders).length > 0) {
    res.headers(extraHeaders);
  }
  res.status(status).json(payload);
}

function parseJsonBody(body) {
  if (!body || body === '') return null;
  try {
    const decoded = JSON.parse(body);
    return typeof decoded === 'object' && decoded != null ? decoded : null;
  } catch {
    return null;
  }
}

function parseFormBody(body) {
  if (!body || body === '') return {};
  const params = new URLSearchParams(body);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

module.exports = {
  isShopRequest,
  errorJson,
  parseJsonBody,
  parseFormBody,
};

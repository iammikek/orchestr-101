const { DomainException } = require('../Exceptions/DomainException');
const { UserEmailExistsException } = require('../Exceptions/UserEmailExistsException');
const { isShopRequest, errorJson } = require('./Http');

function handleException(err, req, res) {
  if (err instanceof DomainException) {
    if (err instanceof UserEmailExistsException && isShopRequest(req.getPath())) {
      throw err;
    }

    if (isShopRequest(req.getPath()) && (err.status === 404)) {
      res.status(404).header('Content-Type', 'text/html').send('Not Found');
      return;
    }

    errorJson(res, err.message, err.status, err.code);
    return;
  }

  if (err instanceof UserEmailExistsException && isShopRequest(req.getPath())) {
    throw err;
  }

  console.error(err);
  if (!res.finished) {
    res.status(500).json({ detail: 'Internal Server Error' });
  }
}

function routeHandler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      handleException(err, req, res);
    }
  };
}

module.exports = { handleException, routeHandler };

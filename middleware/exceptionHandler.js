const { handleException } = require('../app/Support/handleRequest');

function exceptionHandler(req, res, next) {
  const run = async () => {
    try {
      await next();
    } catch (err) {
      handleException(err, req, res);
    }
  };
  return run();
}

module.exports = { exceptionHandler };

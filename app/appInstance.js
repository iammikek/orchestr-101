/**
 * Application instance - set by bootstrap/app.js so routes/helpers can access db without using internal orchestr paths.
 */
let instance = null;

function setApp(app) {
  instance = app;
}

function getApp() {
  return instance;
}

module.exports = { setApp, getApp };

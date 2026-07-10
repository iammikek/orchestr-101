const { Session, parseCookies } = require('../app/Support/Session');

function attachSessionCookie(res, sessionId) {
  if (!sessionId) return;
  res.cookie('orchestr_session', sessionId, {
    httpOnly: true,
    path: '/',
    sameSite: 'Lax',
  });
}

function sessionMiddleware(req, res, next) {
  Session.bind(req);
  const cookies = parseCookies(req);
  let sessionId = cookies.orchestr_session;

  if (!sessionId || !Session.getSessionsMap().has(sessionId)) {
    const crypto = require('crypto');
    sessionId = crypto.randomUUID();
    Session.setSessionForTest(sessionId, {});
  }

  req._sessionId = sessionId;
  req._sessionStore = Session.getSessionsMap().get(sessionId);
  Session.bind(req);

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalRedirect = res.redirect.bind(res);

  const withCookie = (fn) => (...args) => {
    attachSessionCookie(res, sessionId);
    return fn(...args);
  };

  res.json = withCookie(originalJson);
  res.send = withCookie(originalSend);
  res.redirect = withCookie(originalRedirect);

  next();
}

module.exports = { sessionMiddleware };

const crypto = require('crypto');

const sessions = new Map();
let currentReq = null;

function parseCookies(req) {
  const header = req.header('cookie') || req.header('Cookie') || '';
  const cookies = {};
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name) cookies[name] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

function bindRequest(req) {
  currentReq = req;
}

function getStore() {
  if (!currentReq) return null;
  if (currentReq._sessionStore) return currentReq._sessionStore;
  if (!currentReq._sessionStore) {
    const cookies = parseCookies(currentReq);
    let sessionId = cookies.orchestr_session;
    if (!sessionId || !sessions.has(sessionId)) {
      sessionId = crypto.randomUUID();
      sessions.set(sessionId, {});
    }
    currentReq._sessionStore = sessions.get(sessionId);
    currentReq._sessionId = sessionId;
  }
  return currentReq._sessionStore;
}

function getSessionId() {
  if (!currentReq) return null;
  getStore();
  return currentReq._sessionId;
}

class Session {
  static bind(req) {
    bindRequest(req);
  }

  static destroy() {
    sessions.clear();
    currentReq = null;
  }

  static resetForTests() {
    sessions.clear();
    currentReq = null;
  }

  static login(user) {
    const store = getStore();
    if (!store) return;
    store.user_id = Number(user.id);
    store.user_email = user.email;
  }

  static logout() {
    const store = getStore();
    if (!store) return;
    Object.keys(store).forEach((k) => delete store[k]);
  }

  static isLoggedIn() {
    const store = getStore();
    return store != null && store.user_id != null;
  }

  static user() {
    const store = getStore();
    if (!store || store.user_id == null || store.user_email == null) return null;
    return { id: Number(store.user_id), email: String(store.user_email) };
  }

  static flash(key, value) {
    const store = getStore();
    if (!store) return;
    if (!store._flash) store._flash = {};
    store._flash[key] = value;
  }

  static getFlash(key, defaultValue = null) {
    const store = getStore();
    if (!store || !store._flash) return defaultValue;
    const value = store._flash[key] ?? defaultValue;
    delete store._flash[key];
    return value;
  }

  static setOldInput(input) {
    const store = getStore();
    if (!store) return;
    store._old = input;
  }

  static old(key, defaultValue = '') {
    const store = getStore();
    if (!store || !store._old) return defaultValue;
    return store._old[key] ?? defaultValue;
  }

  static getOldInput() {
    const store = getStore();
    return store?._old ? { ...store._old } : {};
  }

  static clearOldInput() {
    const store = getStore();
    if (store) delete store._old;
  }

  static getErrors() {
    const store = getStore();
    if (!store || !store._errors) return {};
    const errors = { ...store._errors };
    delete store._errors;
    return errors;
  }

  static setError(field, message) {
    const store = getStore();
    if (!store) return;
    if (!store._errors) store._errors = {};
    store._errors[field] = message;
  }

  static firstError() {
    const errors = Session.getErrors();
    const values = Object.values(errors);
    return values.length > 0 ? values[0] : null;
  }

  static setSessionForTest(sessionId, data) {
    sessions.set(sessionId, data);
  }

  static getSessionsMap() {
    return sessions;
  }

  static getSessionId() {
    return getSessionId();
  }
}

module.exports = { Session, parseCookies };

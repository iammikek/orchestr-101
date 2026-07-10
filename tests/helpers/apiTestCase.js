const { TestResponse } = require('./testResponse');
const { Session } = require('../../app/Support/Session');
const { UserService } = require('../../app/Services/UserService');

function createApiTestCase(server) {
  let defaultHeaders = {};
  const cookies = [];

  function storeCookies(response) {
    const setCookie = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [];
    const raw = response.headers.get('set-cookie');
    const values = setCookie.length > 0 ? setCookie : (raw ? raw.split(/,(?=[^;]+?=)/) : []);
    for (const header of values) {
      const part = header.split(';')[0].trim();
      const name = part.split('=')[0];
      const existing = cookies.findIndex((c) => c.startsWith(`${name}=`));
      if (existing >= 0) cookies.splice(existing, 1);
      cookies.push(part);
    }
  }

  async function request(method, uri, data = {}, headers = {}) {
    const url = server.baseUrl + uri;
    const requestHeaders = { ...defaultHeaders, ...headers };

    if (cookies.length > 0) {
      requestHeaders.Cookie = cookies.join('; ');
    }

    const init = { method, headers: requestHeaders, redirect: 'manual' };

    if (Object.keys(data).length > 0) {
      if ((requestHeaders['Content-Type'] || '') === 'application/json') {
        init.body = JSON.stringify(data);
      } else {
        init.body = new URLSearchParams(data).toString();
        requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        init.headers = requestHeaders;
      }
    }

    const response = await fetch(url, init);
    const text = await response.text();
    storeCookies(response);

    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
    }

    return new TestResponse(response.status, response.headers, body, text, api);
  }

  const api = {
    request,
    get: (uri, headers = {}) => request('GET', uri, {}, headers),
    post: (uri, data = {}, headers = {}) => request('POST', uri, data, headers),
    postJson: (uri, data = {}, headers = {}) => {
      headers['Content-Type'] = 'application/json';
      return request('POST', uri, data, headers);
    },
    getJson: (uri, headers = {}) => {
      headers.Accept = 'application/json';
      return request('GET', uri, {}, headers);
    },
    deleteJson: (uri, headers = {}) => request('DELETE', uri, {}, headers),
    withHeaders(headers) {
      defaultHeaders = headers;
      return api;
    },
    bearerHeaders(token) {
      return { Authorization: `Bearer ${token}` };
    },
    async createAuthenticatedToken() {
      await api.postJson('/auth/register', {
        email: 'test@example.com',
        password: 'secret123',
      }).then((r) => r.assertCreated());

      const response = await api.post('/auth/login', {
        username: 'test@example.com',
        password: 'secret123',
      });
      response.assertOk();
      return response.json().access_token;
    },
    actingAs(user) {
      const sessionId = `test-session-${user.id}`;
      Session.setSessionForTest(sessionId, {
        user_id: user.id,
        user_email: user.email,
      });
      cookies.length = 0;
      cookies.push(`orchestr_session=${sessionId}`);
      return api;
    },
    async followRedirects(response) {
      let current = response;
      while ([301, 302, 303, 307, 308].includes(current.status)) {
        const location = current.headers.get('location');
        const pathOnly = location.startsWith('http') ? new URL(location).pathname + new URL(location).search : location;
        current = await api.get(pathOnly);
      }
      return current;
    },
    assertAuthenticatedAs(user) {
      const cookieHeader = cookies.find((c) => c.startsWith('orchestr_session='));
      expect(cookieHeader).toBeTruthy();
      const sessionId = cookieHeader.split('=')[1];
      const store = Session.getSessionsMap().get(sessionId);
      expect(store?.user_email).toBe(user.email);
    },
    async createShopUserEntity() {
      return UserService.create('shopper@example.com', 'secret123');
    },
    async createShopUser() {
      const user = await api.createShopUserEntity();
      await api.post('/shop/login', {
        email: user.email,
        password: 'secret123',
      }).then((r) => r.assertRedirect('/shop'));
      return user;
    },
    resetHeaders() {
      defaultHeaders = {};
      cookies.length = 0;
      Session.resetForTests();
    },
  };

  return api;
}

module.exports = { createApiTestCase };

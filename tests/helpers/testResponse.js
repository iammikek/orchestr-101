class TestResponse {
  constructor(status, headers, body, text, testCase) {
    this.status = status;
    this.headers = headers;
    this.body = body;
    this.text = text;
    this.testCase = testCase;
  }

  assertOk() {
    expect(this.status).toBe(200);
    return this;
  }

  assertCreated() {
    expect(this.status).toBe(201);
    return this;
  }

  assertUnauthorized() {
    expect(this.status).toBe(401);
    return this;
  }

  assertNotFound() {
    expect(this.status).toBe(404);
    return this;
  }

  assertNoContent() {
    expect(this.status).toBe(204);
    return this;
  }

  assertStatus(status) {
    expect(this.status).toBe(status);
    return this;
  }

  assertRedirect(location = null) {
    expect([301, 302, 303, 307, 308]).toContain(this.status);
    if (location != null) {
      expect(this.headers.get('location')).toBe(location);
    }
    return this;
  }

  assertExactJson(data) {
    expect(this.json()).toEqual(data);
    return this;
  }

  assertJsonPath(path, expected) {
    expect(this.jsonPath(path)).toBe(expected);
    return this;
  }

  assertJsonCount(count, key = null) {
    const data = this.json();
    if (key != null) {
      expect(data[key]).toHaveLength(count);
    } else {
      expect(data).toHaveLength(count);
    }
    return this;
  }

  assertSee(needle) {
    expect(this.text).toContain(needle);
    return this;
  }

  json() {
    expect(this.body).toBeTruthy();
    return this.body;
  }

  jsonPath(path) {
    let data = this.json();
    for (const segment of path.split('.')) {
      expect(data).toHaveProperty(segment);
      data = data[segment];
    }
    return data;
  }
}

module.exports = { TestResponse };

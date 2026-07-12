"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { callOllama } = require("../response/callOllama");

test.describe("callOllama", () => {
  let originalFetch;

  test.beforeEach(() => {
    originalFetch = global.fetch;
  });

  test.afterEach(() => {
    global.fetch = originalFetch;
  });

  test.it("returns the stripped response text on success", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ response: '   "hello there"  ' })
    });

    const result = await callOllama("dummy prompt");
    assert.equal(result, "hello there");
  });

  test.it("throws 503 if fetch throws ECONNREFUSED", async () => {
    global.fetch = async () => {
      const err = new Error("connect ECONNREFUSED 127.0.0.1:11434");
      err.code = "ECONNREFUSED";
      throw err;
    };

    try {
      await callOllama("dummy prompt");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.status, 503);
      assert.match(err.message, /is Ollama running/);
    }
  });

  test.it("throws 503 if fetch throws AbortError (timeout)", async () => {
    global.fetch = async () => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      throw err;
    };

    try {
      await callOllama("dummy prompt");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.status, 503);
      assert.match(err.message, /timed out/);
    }
  });

  test.it("throws 503 if response is not ok", async () => {
    global.fetch = async () => ({
      ok: false,
      status: 500
    });

    try {
      await callOllama("dummy prompt");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.status, 503);
      assert.match(err.message, /HTTP 500/);
    }
  });

  test.it("throws 502 if JSON parsing fails", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => { throw new Error("bad json"); }
    });

    try {
      await callOllama("dummy prompt");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.status, 502);
      assert.match(err.message, /Unexpected response/);
    }
  });

  test.it("throws 502 if JSON lacks a string 'response' field", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ response: null })
    });

    try {
      await callOllama("dummy prompt");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.status, 502);
      assert.match(err.message, /unexpected response shape/);
    }
  });
});

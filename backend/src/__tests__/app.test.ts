import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

// Test session token signing & verification logic used in authentication
describe("Session Security & Auth Token Unit Tests", () => {
  const SESSION_SECRET = "test-secret-key-12345";

  const signToken = (userId: string): string => {
    const payload = Buffer.from(userId).toString("base64url");
    const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
    return `${payload}.${sig}`;
  };

  const verifyToken = (token?: string): string | null => {
    if (!token) return null;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
      return Buffer.from(payload, "base64url").toString("utf8");
    } catch {
      return null;
    }
  };

  test("should sign and verify valid session token successfully", () => {
    const userId = "user_123456789";
    const token = signToken(userId);
    assert.ok(token.includes("."));
    const verifiedId = verifyToken(token);
    assert.equal(verifiedId, userId);
  });

  test("should reject tampered auth token signature", () => {
    const userId = "user_123456789";
    const token = signToken(userId);
    const [payload, sig] = token.split(".");
    const tamperedSig = sig.slice(0, -2) + "XX";
    const verifiedId = verifyToken(`${payload}.${tamperedSig}`);
    assert.equal(verifiedId, null);
  });

  test("should return null for missing or malformed token", () => {
    assert.equal(verifyToken(undefined), null);
    assert.equal(verifyToken("invalidtokenstring"), null);
  });
});

describe("API Schema & Route Input Validation Tests", () => {
  test("should validate email format", () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    assert.equal(validateEmail("user@example.com"), true);
    assert.equal(validateEmail("invalid-email"), false);
  });
});

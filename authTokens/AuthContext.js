// AuthContext.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthContext {
  constructor() {
    this.accessTokens = new Set();   // Store only valid access tokens
    this.refreshTokens = new Set();  // Store only valid refresh tokens

    // Periodic cleanup every 5 mins
    setInterval(() => this.cleanupExpiredTokens(), 5 * 60 * 1000);
  }

  setAccessToken(token) {
    this.accessTokens.add(token);
  }

  setRefreshToken(token) {
    this.refreshTokens.add(token);
  }

  removeTokens(token) {
    this.accessTokens.delete(token);
    this.refreshTokens.delete(token);
  }

  isAccessTokenValid(token) {
    return this.accessTokens.has(token);
  }

  isRefreshTokenValid(token) {
    return this.refreshTokens.has(token);
  }

  cleanupExpiredTokens() {
    for (let token of this.accessTokens) {
      if (this._isTokenExpired(token, process.env.JWT_SECRET)) {
        console.log("Removing expired access token.");
        this.accessTokens.delete(token);
      }
    }

    for (let token of this.refreshTokens) {
      if (this._isTokenExpired(token, process.env.JWT_REFRESH_SECRET)) {
        console.log("Removing expired refresh token.");
        this.refreshTokens.delete(token);
      }
    }
  }

  _isTokenExpired(token, secret) {
    try {
      jwt.verify(token, secret);
      return false;
    } catch {
      return true;
    }
  }
}

module.exports = new AuthContext();

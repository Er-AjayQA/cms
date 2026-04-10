const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, jwtSecret, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = { signToken, verifyToken };

const { verifyToken } = require("../../../utils/jwt");
const { fail } = require("../../../utils/response");

function authSuperAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return fail(res, "Unauthorized", 401);
    }

    const payload = verifyToken(token);

    if (payload.type !== "super_admin") {
      return fail(res, "Forbidden", 403);
    }

    req.user = payload;
    next();
  } catch (error) {
    return fail(res, "Invalid token", 401);
  }
}

module.exports = { authSuperAdmin };


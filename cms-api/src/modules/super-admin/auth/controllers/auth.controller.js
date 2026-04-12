const bcrypt = require("bcryptjs");
const { SuperAdmin } = require("../../models");
const { signToken } = require("../../../../utils/jwt");
const { ok, fail } = require("../../../../utils/response");

async function loginSuperAdmin(req, res) {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ where: { email } });
    if (!admin) {
      return fail(res, "Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return fail(res, "Invalid credentials", 401);
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      type: "super_admin",
    });

    return ok(
      res,
      {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      },
      "Login successful",
    );
  } catch (error) {
    return fail(res, error.message);
  }
}

module.exports = { loginSuperAdmin };



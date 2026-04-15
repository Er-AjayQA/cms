const router = require("express").Router();
const {
  createRole,
  createUser,
  deleteRole,
  deleteUser,
  getMyAccess,
  listMenus,
  listRoles,
  listUsers,
  updateRole,
  updateUser,
} = require("../controllers/access.controller");

router.get("/me", getMyAccess);

router.get("/menus", listMenus);

router.get("/roles", listRoles);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const { render_editor } = require("../controllers/dashboardController");
const {
  isAuthenticated,
  setCurrentUser,
} = require("../middleware/authMiddleware");

router.use(isAuthenticated);
router.use(setCurrentUser);

router.get("/", render_editor);
// router.post("/post", post_search);

module.exports = router;

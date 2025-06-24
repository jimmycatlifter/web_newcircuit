const express = require("express");
const router = express.Router();
const {
  render_publisher,
  post_publishercontent,
} = require("../controllers/dashboardController");
const {
  isAuthenticated,
  setCurrentUser,
} = require("../middleware/authMiddleware");

router.use(isAuthenticated);
router.use(setCurrentUser);

router.get("/", render_publisher);
router.post("/post_article", post_publishercontent);

module.exports = router;

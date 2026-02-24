const express = require('express');
const router = express.Router();
const { getAllUsers, createUser } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("MANAGER"), createUser);
router.get("/", protect, authorize("MANAGER"), getAllUsers);

module.exports = router;
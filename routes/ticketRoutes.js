const express = require("express");
const router = express.Router();
const { createTicket, getAllTickets, assignTicket, updateStatus, deleteTicket } = require("../controllers/ticketController");
const { addComment, getComments } = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("USER", "MANAGER"), createTicket);
router.get("/", protect, authorize("MANAGER", "SUPPORT", "USER"), getAllTickets);
router.patch("/:id/assign", protect, authorize("MANAGER", "SUPPORT"), assignTicket);
router.patch("/:id/status", protect, authorize("MANAGER", "SUPPORT"), updateStatus);
router.delete("/:id", protect, authorize("MANAGER"), deleteTicket);

router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, getComments);

module.exports = router;
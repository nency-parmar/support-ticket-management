const express = require("express");
const router = express.Router();
const { createTicket, getAllTickets, getTicketById, updateTicket, deleteTicket, assignTicket } = require("../controllers/ticketController");

const protect = require("../middleware/authMiddleware");

router.post("/tickets", protect, createTicket);
router.get("/tickets", protect, getAllTickets);
router.get("/tickets/:id", protect, getTicketById);
router.put("/tickets/:id", protect, updateTicket);
router.delete("/tickets/:id", protect, deleteTicket);
router.patch("/tickets/:id/assign", protect, assignTicket);

module.exports = router;
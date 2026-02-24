const express = require('express');
const router = express.Router();
const { getAllUsers, createTicket, getUserById, updateUser, deleteUser } = require("../controllers/userController");

router.get("/users", getAllUsers);
router.post("/users", createTicket);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
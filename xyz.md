# Express.js Ticket Management System - Routes Documentation

This document explains all route files used in the Ticket Management System.

Project follows:

* Express Router structure
* Controller-based architecture
* Middleware for Authentication & Authorization

---

# 1️⃣ Auth Routes

## File: authRoutes.js

```javascript
const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

router.post("/login", login);

module.exports = router;
```

## Explanation

• POST /login → Used for user authentication
• Calls login controller
• No protect middleware because login is public

### Flow:

1. User sends email & password
2. Controller verifies credentials
3. JWT token generated
4. Token returned to client

⚠️ Common Error:

* Forgetting to hash/compare password properly
* Not sending token in response

---

# 2️⃣ Comment Routes

## File: commentRoutes.js

```javascript
const express = require("express");
const router = express.Router();
const { updateComment, deleteComment } = require("../controllers/commentController");
const protect = require("../middleware/authMiddleware");

router.patch("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
```

## Explanation

• PATCH /:id → Update comment
• DELETE /:id → Delete comment
• protect middleware required (only logged-in users)

### protect Middleware Role:

* Verifies JWT
* Adds user info to req.user

⚠️ Possible Errors:

* Missing token in header
* Invalid token
* Comment ID not found

---

# 3️⃣ Ticket Routes

## File: ticketRoutes.js

```javascript
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
```

## Explanation

### Create Ticket

POST /
Roles Allowed: USER, MANAGER

### Get All Tickets

GET /
Roles Allowed: MANAGER, SUPPORT, USER

### Assign Ticket

PATCH /:id/assign
Roles Allowed: MANAGER, SUPPORT

### Update Status

PATCH /:id/status
Roles Allowed: MANAGER, SUPPORT

### Delete Ticket

DELETE /:id
Roles Allowed: MANAGER only

### Add Comment

POST /:id/comments
Login required (any role)

### Get Comments

GET /:id/comments
Login required

---

# authorize Middleware Logic

```javascript
authorize("MANAGER", "SUPPORT")
```

• Checks req.user.role
• Allows access only if role matches
• Otherwise returns 403 Forbidden

⚠️ Important:

* protect must run before authorize
* If order reversed → req.user undefined error

---

# 4️⃣ User Routes

## File: userRoutes.js

```javascript
const express = require('express');
const router = express.Router();
const { getAllUsers, createUser } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("MANAGER"), createUser);
router.get("/", protect, authorize("MANAGER"), getAllUsers);

module.exports = router;
```

## Explanation

### Create User

POST /
Only MANAGER can create users

### Get All Users

GET /
Only MANAGER can view users

---

# Complete Role Structure

USER → Create ticket, view tickets
SUPPORT → Assign & update status
MANAGER → Full control (create users, delete tickets)

---

# Middleware Execution Order

Request → protect → authorize → controller → response

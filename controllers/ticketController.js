const Ticket = require("../models/Ticket");
const User = require("../models/User");
const TicketStatusLog = require("../models/TicketStatusLog");

const formatUser = (user) => {
    if (!user) return null;
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role_id ? { id: user.role_id._id, name: user.role_id.name } : null,
        created_at: user.created_at
    };
};

const formatTicket = (ticket) => {
    return {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        created_by: formatUser(ticket.created_by),
        assigned_to: formatUser(ticket.assigned_to),
        created_at: ticket.created_at
    };
};

exports.createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        if (!title || title.length < 5) return res.status(400).json({ message: "Title minimum length: 5 characters" });
        if (!description || description.length < 10) return res.status(400).json({ message: "Description minimum length: 10 characters" });

        const validPriorities = ["LOW", "MEDIUM", "HIGH"];
        const p = validPriorities.includes(priority) ? priority : "MEDIUM";

        const ticket = await Ticket.create({
            title,
            description,
            priority: p,
            status: "OPEN",
            created_by: req.user.id
        });

        await ticket.populate({ path: "created_by", populate: { path: "role_id" } });
        res.status(201).json(formatTicket(ticket));
    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).json({ message: "Server error during creating ticket" });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === "SUPPORT") {
            query.assigned_to = req.user.id;
        } else if (req.user.role === "USER") {
            query.created_by = req.user.id;
        }
        // MANAGER sees all

        const tickets = await Ticket.find(query)
            .populate({ path: "created_by", populate: { path: "role_id" } })
            .populate({ path: "assigned_to", populate: { path: "role_id" } });

        res.status(200).json(tickets.map(formatTicket));
    } catch (error) {
        console.error("Get All Tickets Error:", error);
        res.status(500).json({ message: "Failed to fetch tickets." });
    }
};

exports.assignTicket = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: "userId is required for assignment" });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const targetUser = await User.findById(userId).populate("role_id");
        if (!targetUser) return res.status(400).json({ message: "Target user not found" });
        if (targetUser.role_id.name === "USER") return res.status(400).json({ message: "Tickets cannot be assigned to users with role USER" });

        ticket.assigned_to = userId;
        await ticket.save();

        await ticket.populate({ path: "created_by", populate: { path: "role_id" } });
        await ticket.populate({ path: "assigned_to", populate: { path: "role_id" } });
        res.status(200).json(formatTicket(ticket));
    } catch (error) {
        console.error("Assign Ticket Error:", error);
        res.status(500).json({ message: "Server error during assigning ticket" });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
        if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status enum" });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const transitions = {
            "OPEN": ["IN_PROGRESS"],
            "IN_PROGRESS": ["RESOLVED"],
            "RESOLVED": ["CLOSED"],
            "CLOSED": []
        };

        if (!transitions[ticket.status].includes(status)) {
            return res.status(400).json({ message: `Invalid transition from ${ticket.status} to ${status}` });
        }

        const oldStatus = ticket.status;
        ticket.status = status;
        await ticket.save();

        await TicketStatusLog.create({
            ticket_id: ticket._id,
            old_status: oldStatus,
            new_status: status,
            changed_by: req.user.id
        });

        await ticket.populate({ path: "created_by", populate: { path: "role_id" } });
        await ticket.populate({ path: "assigned_to", populate: { path: "role_id" } });
        res.status(200).json(formatTicket(ticket));
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Server error during updating status" });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.status(204).send();
    } catch (error) {
        console.error("Delete Ticket Error:", error);
        res.status(500).json({ message: "Server error during deleting ticket" });
    }
};
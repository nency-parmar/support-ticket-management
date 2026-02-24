const Ticket = require("../models/Ticket");

exports.createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during creating ticket"
        });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const { status, priority, search, page = 1, limit = 10, sort } = req.query;

        const query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let sortOption = { createdAt: -1 }; // Default: Newest first
        if (sort) {
            const [field, order] = sort.split(":");
            sortOption = { [field]: order === "desc" ? -1 : 1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [tickets, total] = await Promise.all([
            Ticket.find(query)
                .populate("createdBy", "name email")
                .populate("assignedTo", "name email")
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit)),
            Ticket.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: tickets.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: tickets
        });
    } catch (error) {
        console.error("Get All Tickets Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tickets. Please try again later."
        });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }
        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error("Get Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during fetching ticket"
        });
    }
};

exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }
        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error("Update Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during updating ticket"
        });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }
        res.json({
            success: true,
            message: "Ticket deleted successfully"
        });
    } catch (error) {
        console.error("Delete Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during deleting ticket"
        });
    }
};

exports.assignTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }
        ticket.assignedTo = req.body.userId;
        ticket.status = "in-progress";
        await ticket.save();
        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error("Assign Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during assigning ticket"
        });
    }
};
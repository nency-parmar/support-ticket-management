const Comment = require("../models/Comment");
const Ticket = require("../models/Ticket");

async function canAccessTicket(ticket, user) {
    if (user.role === "MANAGER") return true;
    if (user.role === "SUPPORT" && ticket.assigned_to && ticket.assigned_to.toString() === user.id.toString()) return true;
    if (user.role === "USER" && ticket.created_by && ticket.created_by.toString() === user.id.toString()) return true;
    return false;
}

function formatComment(c) {
    return {
        id: c._id,
        comment: c.comment,
        user: c.user_id ? {
            id: c.user_id._id,
            name: c.user_id.name,
            email: c.user_id.email,
            role: c.user_id.role_id ? {
                id: c.user_id.role_id._id,
                name: c.user_id.role_id.name
            } : null
        } : null,
        created_at: c.created_at
    };
}

exports.addComment = async (req, res) => {
    try {
        const { comment } = req.body;
        if (!comment || comment.trim() === "") return res.status(400).json({ message: "Comment required" });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        if (!(await canAccessTicket(ticket, req.user))) {
            return res.status(403).json({ message: "Access denied" });
        }

        const newComment = await Comment.create({
            ticket_id: ticket._id,
            user_id: req.user.id,
            comment: comment.trim()
        });

        await newComment.populate({ path: "user_id", populate: { path: "role_id" } });
        res.status(201).json(formatComment(newComment));
    } catch (error) {
        console.error("Add Comment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getComments = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        if (!(await canAccessTicket(ticket, req.user))) {
            return res.status(403).json({ message: "Access denied" });
        }

        const comments = await Comment.find({ ticket_id: ticket._id })
            .populate({ path: "user_id", populate: { path: "role_id" } })
            .sort({ created_at: 1 });

        res.json(comments.map(formatComment));
    } catch (error) {
        console.error("Get Comments Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { comment } = req.body;
        if (!comment || comment.trim() === "") return res.status(400).json({ message: "Comment required" });

        const existing = await Comment.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Comment not found" });

        if (req.user.role !== "MANAGER" && existing.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        existing.comment = comment.trim();
        await existing.save();

        await existing.populate({ path: "user_id", populate: { path: "role_id" } });
        res.json(formatComment(existing));
    } catch (error) {
        console.error("Update Comment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const existing = await Comment.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: "Comment not found" });

        if (req.user.role !== "MANAGER" && existing.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error("Delete Comment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
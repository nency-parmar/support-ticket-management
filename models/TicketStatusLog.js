const mongoose = require("mongoose");

const statusEnum = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const ticketStatusLogSchema = new mongoose.Schema({
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },
    old_status: {
        type: String,
        enum: statusEnum,
        required: true
    },
    new_status: {
        type: String,
        enum: statusEnum,
        required: true
    },
    changed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: { createdAt: 'changed_at', updatedAt: false } });

module.exports = mongoose.model("TicketStatusLog", ticketStatusLogSchema);

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model("Comment", commentSchema);

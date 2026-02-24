const User = require("../models/User")

exports.createUser = async (req, res) => {
    try {
        const user = await User.create({
            ...req.body,
            created: req.user.id
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.log("Create User Error: ", error)
        res.status(500).json({ message: "Server Error During creating user..." })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const user = await User.find()
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        res.json(user);
    } catch (error) {
        console.error("Get All User Error:", error);
        res.status(500).json({ message: "Server error during fetching users" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!User) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during fetching user"
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Update Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during updating User"
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during deleting user"
        });
    }
};
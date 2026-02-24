const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Please provide name, email, password, and role" });
        }

        const existingRole = await Role.findOne({ name: role.toUpperCase() });
        if (!existingRole) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role_id: existingRole._id
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: existingRole.name,
            created_at: user.created_at
        });
    } catch (error) {
        console.error("Create User Error:", error);
        res.status(500).json({ message: "Server error during creating user" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("role_id", "name");

        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role_id ? user.role_id.name : null,
            created_at: user.created_at
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error("Get All User Error:", error);
        res.status(500).json({ message: "Server error during fetching users" });
    }
};
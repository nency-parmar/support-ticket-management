const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data received."
            });
        }
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({ email }).populate("role_id");

        if (user && (await bcrypt.compare(password, user.password))) {
            const roleName = user.role_id ? user.role_id.name : "USER"; // Safe fallback
            const token = jwt.sign(
                { id: user._id, role: roleName },
                process.env.JWT_SECRET || "default_fallback_secret",
                { expiresIn: "1d" }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: roleName
                }
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const Role = require("./models/Role");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ticketDB");

const seedData = async () => {
    try {
        console.log("Seeding database...");

        await Role.deleteMany();
        console.log("Cleared existing roles.");

        const roles = await Role.insertMany([
            { name: "MANAGER" },
            { name: "SUPPORT" },
            { name: "USER" }
        ]);
        console.log("Roles created:", roles.map(r => r.name));

        const managerRole = roles.find(r => r.name === "MANAGER");

        await User.deleteOne({ email: "admin@example.com" });

        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
            name: "Initial Manager",
            email: "admin@example.com",
            password: hashedPassword,
            role_id: managerRole._id
        });

        console.log("Initial manager created. Credentials:");
        console.log("Email: admin@example.com");
        console.log("Password: password123");

        console.log("Data Seeded Successfully.");
        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();

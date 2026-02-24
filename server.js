const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "*/*" }));

app.use((req, res, next) => {
    if (typeof req.body === "string" && req.body.trim().startsWith("{")) {
        try {
            req.body = JSON.parse(req.body);
        } catch (e) {

        }
    }
    next();
});

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/tickets", require("./routes/ticketRoutes"));
app.use("/comments", require("./routes/commentRoutes"));

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/authRoutes"));
app.use("/tickets", require("./routes/ticketRoutes"));
app.use("/users", require("./routes/userRoutes"));

app.listen(3000, () => {
    console.log("Server running on Port 3000.");
});
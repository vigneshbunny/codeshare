const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }, // Allow all origins for simplicity
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const sessionSchema = new mongoose.Schema({
    url: { type: String, unique: true, required: true },
    text: { type: String, default: "" },
});

const Session = mongoose.model("Session", sessionSchema);

app.get("/session/:url", async (req, res) => {
    const { url } = req.params;
    let session = await Session.findOne({ url });
    if (!session) {
        session = new Session({ url });
        await session.save();
    }
    res.status(200).json(session);
});

io.on("connection", (socket) => {
    socket.on("join", (url) => {
        socket.join(url);
    });

    socket.on("update-text", async ({ url, text }) => {
        const session = await Session.findOne({ url });
        if (session) {
            session.text = text;
            await session.save();
        }
        io.to(url).emit("text-updated", text);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

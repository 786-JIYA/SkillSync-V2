
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const initializeWorkspaceSocket = require("./sockets/workspace.socket");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // Local development only
        methods: ["GET", "POST"],
    },
});

// Register workspace socket events
initializeWorkspaceSocket(io);

// Start server
server.listen(PORT, () => {
    console.log(`SkillSync server running on port ${PORT}`);
});

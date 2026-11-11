
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const workspaceService = require("../services/workspace.service");

const getRoomName = (teamId) => `workspace:${teamId}`;

const initializeWorkspaceSocket = (io) => {
    // Authenticate socket connections using JWT.
    io.use(async (socket, next) => {
        try {
            const authToken = socket.handshake.auth?.token;
            const headerToken = socket.handshake.headers.authorization;

            const token = authToken || headerToken?.replace(/^Bearer\s+/i, "");

            if (!token) {
                return next(new Error("Authentication token is required"));
            }

            if (!process.env.JWT_SECRET) {
                return next(new Error("Authentication configuration error"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (typeof decoded.sub !== "string") {
                return next(new Error("Invalid authentication token"));
            }

            const student = await prisma.student.findUnique({
                where: { id: decoded.sub },
                select: { id: true },
            });

            if (!student) {
                return next(new Error("Student account not found"));
            }

            socket.data.studentId = student.id;

            next();
        } catch (error) {
            console.error("Socket authentication error:", error.message);
            next(new Error("Invalid or expired authentication token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`Student connected: ${socket.data.studentId}`);

        // JOIN WORKSPACE ROOM
        socket.on("workspace:join", async (payload, callback) => {
            try {
                const { teamId } = payload || {};

                if (!teamId || typeof teamId !== "string") {
                    throw new Error("Valid team ID is required");
                }

                // Verify current team membership.
                await workspaceService.getWorkspaceByTeamId(
                    teamId,
                    socket.data.studentId
                );

                const room = getRoomName(teamId);

                await socket.join(room);

                if (typeof callback === "function") {
                    callback({
                        success: true,
                        message: "Joined workspace successfully",
                    });
                }
            } catch (error) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: error.message || "Unable to join workspace",
                        code: error.code || "WORKSPACE_JOIN_FAILED",
                    });
                }
            }
        });

        // SEND WORKSPACE MESSAGE
        socket.on("workspace:send_message", async (payload, callback) => {
            try {
                const { teamId, content } = payload || {};

                if (!teamId || typeof teamId !== "string") {
                    throw new Error("Valid team ID is required");
                }

                const room = getRoomName(teamId);

                if (!socket.rooms.has(room)) {
                    throw new Error("Join the workspace before sending messages");
                }

                // Service verifies current membership and saves the message.
                const message = await workspaceService.sendWorkspaceMessage(
                    teamId,
                    socket.data.studentId,
                    content
                );

                // Get current members to avoid broadcasting to removed members.
                const members = await prisma.teamMember.findMany({
                    where: { teamId },
                    select: { studentId: true },
                });

                const currentMemberIds = new Set(
                    members.map((member) => member.studentId)
                );

                // Send only to connected sockets belonging to current members.
                const roomSockets = await io.in(room).fetchSockets();

                for (const roomSocket of roomSockets) {
                    if (currentMemberIds.has(roomSocket.data.studentId)) {
                        roomSocket.emit("workspace:new_message", message);
                    } else {
                        await roomSocket.leave(room);
                    }
                }

                if (typeof callback === "function") {
                    callback({
                        success: true,
                        message: "Message sent successfully",
                        data: message,
                    });
                }
            } catch (error) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: error.message || "Unable to send message",
                        code: error.code || "MESSAGE_SEND_FAILED",
                    });
                }
            }
        });

        // LEAVE WORKSPACE ROOM
        socket.on("workspace:leave", async (payload, callback) => {
            try {
                const { teamId } = payload || {};

                if (!teamId || typeof teamId !== "string") {
                    throw new Error("Valid team ID is required");
                }

                await socket.leave(getRoomName(teamId));

                if (typeof callback === "function") {
                    callback({
                        success: true,
                        message: "Left workspace successfully",
                    });
                }
            } catch (error) {
                if (typeof callback === "function") {
                    callback({
                        success: false,
                        message: error.message || "Unable to leave workspace",
                    });
                }
            }
        });

        socket.on("disconnect", () => {
            console.log(`Student disconnected: ${socket.data.studentId}`);
        });
    });
};

module.exports = initializeWorkspaceSocket;

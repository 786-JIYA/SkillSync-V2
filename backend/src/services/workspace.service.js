
const prisma = require("../lib/prisma");

const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

// GET WORKSPACE BY TEAM ID
const getWorkspaceByTeamId = async (teamId, studentId) => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            id: true,
            members: {
                where: { studentId },
                select: { studentId: true },
            },
            workspace: {
                select: {
                    id: true,
                    teamId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    if (!team) {
        throw createError(
            "Team not found",
            404,
            "TEAM_NOT_FOUND"
        );
    }

    if (team.members.length === 0) {
        throw createError(
            "You are not authorized to access this workspace",
            403,
            "WORKSPACE_ACCESS_DENIED"
        );
    }

    if (!team.workspace) {
        throw createError(
            "Workspace not found",
            404,
            "WORKSPACE_NOT_FOUND"
        );
    }

    return team.workspace;
};

// GET WORKSPACE MESSAGES WITH PAGINATION
const getWorkspaceMessages = async (
    teamId,
    studentId,
    page = 1,
    limit = DEFAULT_PAGE_SIZE
) => {
    // Verify workspace access first.
    const workspace = await getWorkspaceByTeamId(
        teamId,
        studentId
    );

    // Normalize pagination values.
    page = Number.parseInt(page, 10);
    limit = Number.parseInt(limit, 10);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
        limit = DEFAULT_PAGE_SIZE;
    }

    limit = Math.min(limit, MAX_PAGE_SIZE);

    const skip = (page - 1) * limit;

    // Fetch messages and total count.
    const [messages, totalMessages] = await prisma.$transaction([
        prisma.workspaceMessage.findMany({
            where: {
                workspaceId: workspace.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { createdAt: "asc" },
                { id: "asc" },
            ],
            skip,
            take: limit,
        }),

        prisma.workspaceMessage.count({
            where: {
                workspaceId: workspace.id,
            },
        }),
    ]);

    return {
        messages,
        pagination: {
            currentPage: page,
            pageSize: limit,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
        },
    };
};

// SEND WORKSPACE MESSAGE
const sendWorkspaceMessage = async (
    teamId,
    studentId,
    content
) => {
    // Verify workspace access first.
    const workspace = await getWorkspaceByTeamId(
        teamId,
        studentId
    );

    // Validate message content.
    if (typeof content !== "string" || !content.trim()) {
        throw createError(
            "Message content is required",
            400,
            "MESSAGE_CONTENT_REQUIRED"
        );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
        throw createError(
            `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
            400,
            "MESSAGE_TOO_LONG"
        );
    }

    // Save message in database.
    const message = await prisma.workspaceMessage.create({
        data: {
            workspaceId: workspace.id,
            senderId: studentId,
            content: trimmedContent,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return message;
};

module.exports = {
    getWorkspaceByTeamId,
    getWorkspaceMessages,
    sendWorkspaceMessage,
};

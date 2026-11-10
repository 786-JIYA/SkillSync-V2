
const prisma = require("../lib/prisma");

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
        throw createError("Team not found", 404, "TEAM_NOT_FOUND");
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


// GET WORKSPACE MESSAGES
const getWorkspaceMessages = async (teamId, studentId) => {
    // Verify workspace access first.
    const workspace = await getWorkspaceByTeamId(teamId, studentId);

    const messages = await prisma.workspaceMessage.findMany({
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
        orderBy: {
            createdAt: "asc",
        },
    });

    return messages;
};


module.exports = {
    getWorkspaceByTeamId,
    getWorkspaceMessages
};

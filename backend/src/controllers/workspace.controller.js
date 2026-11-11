
const workspaceService = require("../services/workspace.service");

// GET /api/v1/teams/:teamId/workspace
const getWorkspaceByTeamId = async (req, res) => {
    try {
        const workspace = await workspaceService.getWorkspaceByTeamId(
            req.params.teamId,
            req.student.id
        );

        return res.status(200).json({
            success: true,
            message: "Workspace fetched successfully",
            data: workspace,
        });
    } catch (error) {
        console.error("Get workspace error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};


// GET /api/v1/teams/:teamId/workspace/messages
const getWorkspaceMessages = async (req, res) => {
    try {
        const result = await workspaceService.getWorkspaceMessages(
            req.params.teamId,
            req.student.id,
            req.query.page,
            req.query.limit
        );

        return res.status(200).json({
            success: true,
            message: "Workspace messages fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("Get workspace messages error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};


const sendWorkspaceMessage = async (req, res) => {
    try {
        const message = await workspaceService.sendWorkspaceMessage(
            req.params.teamId,
            req.student.id,
            req.body.content
        );

        return res.status(201).json({
            success: true,
            message: "Workspace message sent successfully",
            data: message,
        });
    } catch (error) {
        console.error("Send workspace message error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};


module.exports = {
    getWorkspaceByTeamId,
    getWorkspaceMessages,
    sendWorkspaceMessage
};

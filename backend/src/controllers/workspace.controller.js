
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

module.exports = {
    getWorkspaceByTeamId,
};

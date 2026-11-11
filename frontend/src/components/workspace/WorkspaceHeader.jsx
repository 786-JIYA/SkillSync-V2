import { Link } from "react-router-dom";

const STATUS = {
    connected: { label: "Live", tone: "ok" },
    connecting: { label: "Connecting...", tone: "warn" },
    disconnected: { label: "Reconnecting...", tone: "warn" },
    error: { label: "Offline", tone: "danger" },
    denied: { label: "No access", tone: "danger" },
};

function WorkspaceHeader({ team, teamId, status, memberCount, onToggleTeam, teamOpen }) {
    const project = team?.project;
    const s = STATUS[status] || STATUS.connecting;

    return (
        <header className="ws-header">
            <div className="ws-header-main">
                <nav className="ws-links" aria-label="Workspace navigation">
                    <Link to={`/teams/${teamId}`}>&larr; Team</Link>
                    {project?.id && <Link to={`/projects/${project.id}`}>Project details</Link>}
                </nav>

                <h1>{project?.title || "Project workspace"}</h1>
                {project?.description && <p className="ws-desc">{project.description}</p>}
            </div>

            <div className="ws-header-side">
                <span className={`ws-status ws-status-${s.tone}`} role="status">
                    <span className="ws-dot" aria-hidden="true" />
                    {s.label}
                </span>
                <span className="ws-team-id">Team {String(teamId).slice(0, 8)}</span>
                <button
                    type="button"
                    className="btn btn-outline ws-team-toggle"
                    aria-expanded={teamOpen}
                    onClick={onToggleTeam}
                >
                    Team ({memberCount})
                </button>
            </div>
        </header>
    );
}

export default WorkspaceHeader;

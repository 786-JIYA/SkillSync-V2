import { Link } from "react-router-dom";

const roleLabel = (role) =>
    role ? role.charAt(0) + role.slice(1).toLowerCase() : "Member";

function WorkspaceSidebar({ members = [], currentId, open }) {
    return (
        <aside className={`ws-sidebar ${open ? "is-open" : ""}`} aria-label="Team members">
            <h2>Team members</h2>
            <p className="ws-sidebar-count">{members.length} in this workspace</p>

            <ul className="ws-members">
                {members.map((member) => (
                    <li key={member.studentId}>
                        <span className="ws-avatar" aria-hidden="true">
                            {member.name?.charAt(0)?.toUpperCase() || "S"}
                        </span>
                        <span className="ws-member-text">
                            <Link to={`/students/${member.studentId}`}>
                                {member.name}
                                {member.studentId === currentId && " (You)"}
                            </Link>
                            <small>{roleLabel(member.role)}</small>
                        </span>
                    </li>
                ))}
            </ul>

            {members.length === 0 && <p className="ws-sidebar-empty">No members found.</p>}
        </aside>
    );
}

export default WorkspaceSidebar;

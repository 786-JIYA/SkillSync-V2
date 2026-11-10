import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Icon } from "../components/Icon.jsx";
import { skillService } from "../services/skillService";
import { invitationService } from "../services/invitationService";
import { joinRequestService } from "../services/joinRequestService";
import { projectService } from "../services/projectService";
import "./Dashboard.css";

// Works whether the API returns { data: [...] } or { data: { something: [...] } }.
function countOf(settled) {
    if (settled.status !== "fulfilled") return null;
    const data = settled.value?.data;
    const list = Array.isArray(data)
        ? data
        : Object.values(data || {}).find(Array.isArray);
    return list ? list.length : null;
}

const ACTIONS = [
    { to: "/projects", icon: "folder", title: "Browse projects", text: "See open projects and the skills they need." },
    { to: "/projects/create", icon: "plus", title: "Start a project", text: "Describe your idea and pick the skills you need." },
    { to: "/students", icon: "users", title: "Find students", text: "Search the directory by name, PRN or department." },
    { to: "/profile", icon: "user", title: "Edit your profile", text: "Add a short bio and your GitHub and LinkedIn." },
];

function Dashboard() {
    const { student, token } = useAuth();
    const [counts, setCounts] = useState({});

    useEffect(() => {
        if (!token) return undefined;
        let active = true;

        Promise.allSettled([
            skillService.getMySkills(token),
            invitationService.getMyInvitations(token, "PENDING"),
            joinRequestService.getMyJoinRequests(token, "PENDING"),
            projectService.getMyProjects(token),
        ]).then(([skills, invitations, requests, projects]) => {
            if (!active) return;
            setCounts({
                skills: countOf(skills),
                invitations: countOf(invitations),
                requests: countOf(requests),
                projects: countOf(projects),
            });
        });

        return () => {
            active = false;
        };
    }, [token]);

    const department =
        typeof student?.department === "object"
            ? student?.department?.name
            : student?.department;

    const firstName = student?.name?.split(" ")[0] || "there";
    const show = (n) => (n === null || n === undefined ? "–" : n);

    const stats = [
        { to: "/skills", label: "Skills added", value: show(counts.skills) },
        { to: "/my-activity", label: "Pending invitations", value: show(counts.invitations) },
        { to: "/my-activity", label: "Pending join requests", value: show(counts.requests) },
        { to: "/projects", label: "Your projects", value: show(counts.projects) },
    ];

    return (
        <div className="dash">
            <section className="dash-hero">
                <div>
                    <h1>Good to see you, {firstName}</h1>
                    <p>
                        Keep your skills current and SkillSync will surface the
                        projects and teammates that fit you best.
                    </p>
                </div>

                <div className="dash-hero-actions">
                    <Link to="/projects" className="btn btn-amber">
                        Find a project <Icon name="arrow" size={18} />
                    </Link>
                    <Link to="/skills" className="btn dash-ghost">
                        Update my skills
                    </Link>
                </div>
            </section>

            <section className="dash-stats" aria-label="Your activity">
                {stats.map((s) => (
                    <Link to={s.to} className="dash-stat" key={s.label}>
                        <strong>{s.value}</strong>
                        <span>{s.label}</span>
                    </Link>
                ))}
            </section>

            <section>
                <h2 className="dash-heading">Jump back in</h2>
                <div className="dash-actions">
                    {ACTIONS.map((a) => (
                        <Link to={a.to} className="dash-action" key={a.to}>
                            <span className="dash-action-icon">
                                <Icon name={a.icon} />
                            </span>
                            <span>
                                <strong>{a.title}</strong>
                                <small>{a.text}</small>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="dash-account">
                <div className="dash-account-head">
                    <span className="avatar dash-avatar">
                        {firstName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <h2>{student?.name || "Student"}</h2>
                        <p>{student?.email || "Email not available"}</p>
                    </div>
                    <Link to="/profile" className="btn btn-outline dash-account-link">
                        View profile
                    </Link>
                </div>

                <dl className="dash-details">
                    <div><dt>PRN</dt><dd>{student?.prn || "–"}</dd></div>
                    <div><dt>Department</dt><dd>{department || "–"}</dd></div>
                    <div><dt>Class year</dt><dd>{student?.classYear ?? "–"}</dd></div>
                    <div><dt>Division</dt><dd>{student?.division || "Not specified"}</dd></div>
                </dl>
            </section>
        </div>
    );
}

export default Dashboard;

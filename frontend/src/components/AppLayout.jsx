import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BrandMark, Icon } from "./Icon.jsx";
import "./AppLayout.css";

const NAV = [
    {
        label: "Workspace",
        items: [
            { to: "/dashboard", text: "Overview", icon: "home" },
            { to: "/projects", text: "Projects", icon: "folder", also: ["/teams"] },
            { to: "/students", text: "Student directory", icon: "users" },
        ],
    },
    {
        label: "Me",
        items: [
            { to: "/my-activity", text: "My activity", icon: "inbox" },
            { to: "/skills", text: "My skills", icon: "spark" },
            { to: "/profile", text: "My profile", icon: "user" },
        ],
    },
];

function getMeta(path) {
    if (path === "/dashboard") return ["Workspace", "Overview"];
    if (path === "/projects/create") return ["Projects", "New project"];
    if (path.startsWith("/projects/")) return ["Projects", "Project details"];
    if (path === "/projects") return ["Workspace", "Projects"];
    if (path.startsWith("/students/")) return ["Student directory", "Student profile"];
    if (path === "/students") return ["Workspace", "Student directory"];
    if (path.endsWith("/requests")) return ["Team", "Join requests"];
    if (path.endsWith("/workspace")) return ["Team", "Workspace"];
    if (path.endsWith("/invitations")) return ["Team", "Invitations"];
    if (path.startsWith("/teams/")) return ["Projects", "Team workspace"];
    if (path === "/my-activity") return ["Me", "My activity"];
    if (path === "/skills") return ["Me", "My skills"];
    if (path === "/profile") return ["Me", "My profile"];
    return ["SkillSync", ""];
}

function isActive(pathname, item) {
    const roots = [item.to, ...(item.also || [])];
    return roots.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function AppLayout() {
    const { student, logout } = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const department =
        typeof student?.department === "object"
            ? student?.department?.name
            : student?.department;
    const name = student?.name || "Student";
    const initial = name.charAt(0).toUpperCase();
    const [section, title] = getMeta(pathname);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <div className="shell">
            <a className="skip-link" href="#main">Skip to content</a>

            <aside className={`rail ${open ? "is-open" : ""}`} aria-label="Sidebar">
                <Link to="/dashboard" className="rail-brand">
                    <BrandMark size={30} />
                    <span>SkillSync</span>
                </Link>

                <Link to="/projects/create" className="btn btn-amber rail-cta">
                    <Icon name="plus" size={18} /> New project
                </Link>

                <nav className="rail-nav" aria-label="Primary">
                    {NAV.map((group) => (
                        <div key={group.label}>
                            <p className="rail-group">{group.label}</p>
                            {group.items.map((item) => {
                                const active = isActive(pathname, item);
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={`rail-link ${active ? "is-active" : ""}`}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        <Icon name={item.icon} size={19} />
                                        {item.text}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="rail-foot">
                    <div className="rail-user">
                        <span className="avatar">{initial}</span>
                        <span className="rail-user-text">
                            <strong>{name}</strong>
                            <small>{department || "Student"}</small>
                        </span>
                    </div>
                    <button type="button" className="rail-logout" onClick={handleLogout}>
                        <Icon name="logout" size={18} /> Log out
                    </button>
                </div>
            </aside>

            {open && (
                <button
                    type="button"
                    className="rail-backdrop"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                />
            )}

            <div className="shell-main">
                <header className="topbar-bar">
                    <button
                        type="button"
                        className="menu-button"
                        aria-label="Open menu"
                        aria-expanded={open}
                        onClick={() => setOpen(true)}
                    >
                        <Icon name="menu" />
                    </button>

                    <nav className="crumbs" aria-label="Breadcrumb">
                        <span>{section}</span>
                        {title && (
                            <>
                                <span aria-hidden="true">/</span>
                                <strong>{title}</strong>
                            </>
                        )}
                    </nav>

                    <Link to="/profile" className="chip" aria-label="Open my profile">
                        <span className="avatar avatar-sm">{initial}</span>
                        <span className="chip-name">{name}</span>
                    </Link>
                </header>

                <main id="main" className="app-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;

import { Link } from "react-router-dom";
import { BrandMark } from "./Icon.jsx";
import "./AuthLayout.css";

const SAMPLE_MATCHES = [
    { initial: "A", name: "Aarav", skills: "React, Figma", score: 94 },
    { initial: "S", name: "Sana", skills: "Node.js, SQL", score: 88 },
    { initial: "R", name: "Rohan", skills: "Node.js", score: 71 },
];

function AuthLayout({ activeTab, children }) {
    return (
        <div className="auth-shell">
            <section className="auth-aside">
                <Link to="/" className="auth-brand">
                    <BrandMark size={32} />
                    <span>SkillSync</span>
                </Link>

                <div className="auth-pitch">
                    <p className="auth-headline">
                        Build your team around what people can actually do.
                    </p>
                    <p className="auth-sub">
                        Add your skills, find projects that need them, and invite the
                        students who fill the gaps.
                    </p>

                    <div className="match-card" aria-hidden="true">
                        <div className="match-card-head">
                            <strong>Campus Navigator app</strong>
                            <span>Needs React, Node.js, UI design</span>
                        </div>
                        {SAMPLE_MATCHES.map((m) => (
                            <div className="match-row" key={m.name}>
                                <span className="match-avatar">{m.initial}</span>
                                <span className="match-who">
                                    <strong>{m.name}</strong>
                                    <small>{m.skills}</small>
                                </span>
                                <span className="match-score">{m.score}% match</span>
                            </div>
                        ))}
                        <p className="match-note">Example of how candidates are ranked for a team.</p>
                    </div>
                </div>

                <p className="auth-help">
                    Need help? <a href="mailto:help@skillsync.edu">help@skillsync.edu</a>
                </p>
            </section>

            <main className="auth-main">
                <div className="auth-panel">
                    <nav className="auth-tabs" aria-label="Account">
                        <Link
                            to="/login"
                            className={activeTab === "login" ? "active" : ""}
                            aria-current={activeTab === "login" ? "page" : undefined}
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className={activeTab === "register" ? "active" : ""}
                            aria-current={activeTab === "register" ? "page" : undefined}
                        >
                            Create account
                        </Link>
                    </nav>

                    {children}
                </div>
            </main>
        </div>
    );
}

export default AuthLayout;

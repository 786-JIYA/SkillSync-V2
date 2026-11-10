import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import "./StudentProfile.css";

function StudentProfile() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            setLoading(true);
            setError("");

            try {
                const result = await studentService.getStudentById(
                    token,
                    studentId
                );

                if (active) {
                    setProfile(result.data?.student || result.data);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load student profile.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (token && studentId) {
            loadProfile();
        }

        return () => {
            active = false;
        };
    }, [token, studentId]);

    if (loading) {
        return (
            <div className="student-profile-page">
                <p className="student-profile-message">
                    Loading student profile...
                </p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="student-profile-page">
                <div className="student-profile-message">
                    <h2>Profile unavailable</h2>
                    <p>{error || "Student profile not found."}</p>
                    <button onClick={() => navigate("/students")}>
                        Back to Directory
                    </button>
                </div>
            </div>
        );
    }

    const initials = profile.name
        ?.split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("") || "S";

    return (
        <div className="student-profile-page">
            <button
                className="student-profile-back"
                onClick={() => navigate("/students")}
            >
                ← Back to Student Directory
            </button>

            <section className="student-profile-header">
                <div className="student-profile-avatar">
                    {initials}
                </div>

                <div className="student-profile-identity">
                    <h1>{profile.name}</h1>
                    <p>
                        {profile.department} · Year {profile.classYear}
                    </p>
                    <span>Student</span>
                </div>
            </section>

            <section className="student-profile-section">
                <h2>About</h2>
                <p>
                    {profile.bio || "This student has not added a bio yet."}
                </p>
            </section>

            <section className="student-profile-section">
                <h2>Academic Information</h2>

                <div className="student-profile-details">
                    <div>
                        <span>PRN</span>
                        <strong>{profile.prn || "Not available"}</strong>
                    </div>

                    <div>
                        <span>Department</span>
                        <strong>{profile.department || "Not available"}</strong>
                    </div>

                    <div>
                        <span>Class Year</span>
                        <strong>{profile.classYear || "Not available"}</strong>
                    </div>

                    <div>
                        <span>Division</span>
                        <strong>{profile.division || "Not specified"}</strong>
                    </div>
                </div>
            </section>

            <section className="student-profile-section">
                <h2>Skills & Competencies</h2>

                {profile.skills?.length > 0 ? (
                    <div className="student-profile-skills">
                        {profile.skills.map((skill) => (
                            <div className="student-profile-skill" key={skill.id}>
                                <strong>{skill.name}</strong>
                                <span>{skill.category}</span>
                                <small>
                                    Proficiency: {skill.proficiency}/5
                                </small>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No skills added yet.</p>
                )}
            </section>

            <section className="student-profile-section">
                <h2>Social Links</h2>

                <div className="student-profile-links">
                    {profile.linkedinUrl && (
                        <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            LinkedIn ↗
                        </a>
                    )}

                    {profile.githubUrl && (
                        <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub ↗
                        </a>
                    )}

                    {!profile.linkedinUrl && !profile.githubUrl && (
                        <p>No social links added yet.</p>
                    )}
                </div>
            </section>

            <section className="student-profile-section">
                <h2>Created Projects</h2>

                {profile.createdProjects?.length > 0 ? (
                    <div className="student-profile-projects">
                        {profile.createdProjects.map((project) => (
                            <article key={project.id}>
                                <h3>{project.title}</h3>
                                <p>{project.description}</p>
                                <span>{project.status}</span>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p>No projects created yet.</p>
                )}
            </section>

            <section className="student-profile-section">
                <h2>Team Memberships</h2>

                {profile.teamMemberships?.length > 0 ? (
                    <div className="student-profile-projects">
                        {
                            profile.teamMemberships.map((membership, index) => (
                                <article key={`${membership.team?.id || index}-${index}`}>
                                    <h3>
                                        {membership.team?.project?.title || "Project unavailable"}
                                    </h3>

                                    <p>Role: {membership.role}</p>

                                    <span>
                                        Joined:{" "}
                                        {new Date(membership.joinedAt).toLocaleDateString()}
                                    </span>
                                </article>
                            ))
                        }
                    </div>
                ) : (
                    <p>No team memberships yet.</p>
                )}
            </section>
        </div>
    );
}

export default StudentProfile;
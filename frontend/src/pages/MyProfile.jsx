
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import "./MyProfile.css";

function MyProfile() {
    const { student, token } = useAuth();

    const [profile, setProfile] = useState(student);
    const [bio, setBio] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                const result = await studentService.getMyProfile(token);
                const currentProfile = result.data?.student;

                if (active && currentProfile) {
                    setProfile(currentProfile);
                    setBio(currentProfile.bio || "");
                    setLinkedinUrl(currentProfile.linkedinUrl || "");
                    setGithubUrl(currentProfile.githubUrl || "");
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load your profile.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (token) {
            loadProfile();
        }

        return () => {
            active = false;
        };
    }, [token]);

    const getValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "Not available";
        }

        if (typeof value === "object") {
            return value.name || value.title || "Not available";
        }

        return value;
    };

    const initials = profile?.name
        ? profile.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("")
        : "ST";

    const profileFields = [
        { label: "Full Name", value: profile?.name },
        { label: "PRN", value: profile?.prn || profile?.PRN },
        {
            label: "College Email",
            value: profile?.email || profile?.collegeEmail,
        },
        { label: "Department", value: profile?.department },
        {
            label: "Class Year",
            value: profile?.classYear || profile?.year,
        },
        { label: "Division", value: profile?.division },
    ];

    async function handleSaveProfile(e) {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const result = await studentService.updateMyProfile(token, {
                bio: bio.trim(),
                linkedinUrl: linkedinUrl.trim(),
                githubUrl: githubUrl.trim(),
            });

            const updatedProfile = result.data?.student;

            if (updatedProfile) {
                setProfile((previous) => ({
                    ...previous,
                    ...updatedProfile,
                }));
            } else {
                setProfile((previous) => ({
                    ...previous,
                    bio: bio.trim(),
                    linkedinUrl: linkedinUrl.trim(),
                    githubUrl: githubUrl.trim(),
                }));
            }

            setSuccess("Your profile has been updated successfully.");
        } catch (err) {
            setError(err.message || "Unable to update your profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="my-profile-page">
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="my-profile-page">
            <header className="my-profile-header">
                <div>
                    <p className="profile-eyebrow">STUDENT WORKSPACE</p>
                    <h1>My Profile</h1>
                    <p>
                        View your academic information and manage your
                        professional profile.
                    </p>
                </div>
            </header>

            <section className="profile-identity-card">
                <div className="profile-avatar">{initials}</div>

                <div className="profile-identity-info">
                    <h2>{getValue(profile?.name)}</h2>
                    <p>
                        {getValue(profile?.department)}{" "}
                        {profile?.classYear
                            ? `· ${profile.classYear}`
                            : ""}
                    </p>
                    <span className="profile-role">STUDENT</span>
                </div>
            </section>

            <section className="profile-details-card">
                <div className="profile-section-heading">
                    <div>
                        <h2>Academic Information</h2>
                        <p>Your registered student details.</p>
                    </div>

                    <span className="profile-readonly-label">
                        Read only
                    </span>
                </div>

                <div className="profile-details-grid">
                    {profileFields.map((field) => (
                        <div
                            className="profile-detail-item"
                            key={field.label}
                        >
                            <span>{field.label}</span>
                            <strong>{getValue(field.value)}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <section className="profile-details-card">
                <div className="profile-section-heading">
                    <div>
                        <h2>About & Social Links</h2>
                        <p>
                            Tell other students about yourself and share
                            your professional profiles.
                        </p>
                    </div>
                </div>

                <form
                    className="profile-edit-form"
                    onSubmit={handleSaveProfile}
                >
                    <div className="profile-form-group">
                        <label htmlFor="bio">About Me</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Write a short introduction about yourself..."
                            maxLength={500}
                            rows={5}
                        />
                        <small>{bio.length}/500 characters</small>
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                        <input
                            id="linkedinUrl"
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://www.linkedin.com/in/your-profile"
                        />
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="githubUrl">GitHub Profile URL</label>
                        <input
                            id="githubUrl"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/your-username"
                        />
                    </div>

                    {error && (
                        <p className="profile-form-error">{error}</p>
                    )}

                    {success && (
                        <p className="profile-form-success">{success}</p>
                    )}

                    <button
                        type="submit"
                        className="profile-save-button"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </section>

            <section className="profile-skills-card">
                <div className="profile-skills-icon">✦</div>

                <div className="profile-skills-content">
                    <h2>Skills & Competencies</h2>
                    <p>
                        Add your technical skills, update your proficiency,
                        and keep your profile ready for project matching.
                    </p>
                </div>

                <Link to="/skills" className="profile-skills-link">
                    Manage Skills →
                </Link>
            </section>
        </div>
    );
}

export default MyProfile;

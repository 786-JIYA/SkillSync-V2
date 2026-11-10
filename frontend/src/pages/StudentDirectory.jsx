
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import "./StudentDirectory.css";

function StudentDirectory() {
    const navigate = useNavigate();
    const { token, student, logout } = useAuth();

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    // Wait until the user stops typing before searching.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Load students from the backend.
    useEffect(() => {
        let active = true;

        async function loadStudents() {
            setLoading(true);
            setError("");

            try {
                const params = {
                    page,
                    limit: 9,
                };

                if (debouncedSearch) {
                    params.search = debouncedSearch;
                }

                if (department) {
                    params.department = department;
                }

                const result = await studentService.getStudentDirectory(
                    token,
                    params
                );

                if (active) {
                    setStudents(result.data?.students || []);
                    setTotalPages(
                        result.data?.pagination?.totalPages || 1
                    );
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Unable to load students.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (token) {
            loadStudents();
        }

        return () => {
            active = false;
        };
    }, [token, page, debouncedSearch, department, refreshKey]);

    function handleFilterChange(callback, value) {
        callback(value);
        setPage(1);
    }

    return (
        <div className="directory-page">
            <aside className="directory-sidebar">
                <div className="directory-brand">
                    <span className="brand-symbol">S</span>
                    <span>SkillSync</span>
                </div>

                <nav className="directory-nav">
                    <button onClick={() => navigate("/dashboard")}>
                        Overview
                    </button>

                    <button onClick={() => navigate("/skills")}>
                        My Skills
                    </button>

                    <button onClick={() => navigate("/projects")}>
                        Projects
                    </button>

                    <button className="active">
                        Student Directory
                    </button>
                </nav>

                <div className="directory-sidebar-bottom">
                    <strong>{student?.name || "Student"}</strong>
                    <button onClick={logout}>Logout</button>
                </div>
            </aside>

            <main className="directory-main">
                <header className="directory-topbar">
                    <span>Student Workspace / Directory</span>

                    <div>
                        {student?.name?.charAt(0) || "S"}
                    </div>
                </header>

                <section className="directory-content">
                    <div className="directory-heading">
                        <p className="directory-eyebrow">
                            CONNECT & COLLABORATE
                        </p>

                        <h1>Student Directory</h1>

                        <p>
                            Discover talented students, explore their skills,
                            and find potential collaborators.
                        </p>
                    </div>

                    <div className="directory-filters">
                        <input
                            type="search"
                            placeholder="Search by student name or PRN..."
                            value={search}
                            onChange={(e) =>
                                handleFilterChange(setSearch, e.target.value)
                            }
                        />

                        <select
                            value={department}
                            onChange={(e) =>
                                handleFilterChange(setDepartment, e.target.value)
                            }
                        >
                            <option value="">All Departments</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ENTC">ENTC</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                        </select>
                    </div>

                    {loading && (
                        <div className="directory-message">
                            Loading students...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="directory-error">
                            <p>{error}</p>

                            <button
                                onClick={() => setRefreshKey((key) => key + 1)}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && students.length === 0 && (
                        <div className="directory-empty">
                            <h3>No students found</h3>
                            <p>
                                Try changing your search or department filter.
                            </p>
                        </div>
                    )}

                    {!loading && !error && students.length > 0 && (
                        <>
                            <div className="directory-results-heading">
                                <h2>Students</h2>
                                <span>{students.length} students shown</span>
                            </div>

                            <div className="directory-grid">
                                {students.map((item) => (
                                    <article
                                        className="directory-card"
                                        key={item.id}
                                    >
                                        <div className="directory-avatar">
                                            {item.name?.charAt(0) || "S"}
                                        </div>

                                        <h3>{item.name}</h3>

                                        <p>
                                            {item.department} · Year {item.classYear}
                                        </p>

                                        <div className="directory-skills">
                                            {item.skills?.slice(0, 4).map((skill) => (
                                                <span key={skill.id}>
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(`/students/${item.id}`)
                                            }
                                        >
                                            View Profile →
                                        </button>
                                    </article>
                                ))}
                            </div>

                            <div className="directory-pagination">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Previous
                                </button>

                                <span>
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default StudentDirectory;


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(endpoint, token, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });
    } catch {
        throw new Error(
            "Cannot connect to the server. Check whether the backend is running."
        );
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
        const error = new Error(
            result.message || "Something went wrong. Please try again."
        );

        error.status = response.status;
        throw error;
    }

    return result;
}

export const studentService = {
    // Get logged-in student's complete profile
    getMyProfile(token) {
        return request("/students/me", token);
    },

    // Update logged-in student's profile
    updateMyProfile(token, profileData) {
        return request("/students/me", token, {
            method: "PATCH",
            body: JSON.stringify(profileData),
        });
    },

    // Browse students with optional filters and pagination
    getStudentDirectory(token, params = {}) {
        const query = new URLSearchParams(params).toString();

        return request(
            `/students${query ? `?${query}` : ""}`,
            token
        );
    },

    // View another student's public profile
    getStudentById(token, studentId) {
        return request(
            `/students/${encodeURIComponent(studentId)}`,
            token
        );
    },
};

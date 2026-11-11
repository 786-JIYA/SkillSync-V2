const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Socket.IO lives on the server origin (no /api/v1). Override with VITE_SOCKET_URL if needed.
export const SOCKET_URL = (() => {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
    try {
        return new URL(API_BASE_URL).origin;
    } catch {
        return window.location.origin;
    }
})();

export const MESSAGE_LIMIT = 2000;

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

// Accepts { senderName } or { sender: { id, name } } shapes.
export function normalizeMessage(m) {
    if (!m || typeof m !== "object" || m.id === undefined) return null;
    return {
        id: m.id,
        senderId: m.senderId ?? m.sender?.id,
        senderName: m.senderName ?? m.sender?.name ?? "Student",
        content: m.content ?? "",
        createdAt: m.createdAt,
    };
}

// Finds the saved message inside a socket acknowledgement, whatever key it sits under.
export function pickMessage(res) {
    const candidates = [res?.data?.message, res?.data, res?.message];
    for (const c of candidates) {
        const n = normalizeMessage(c);
        if (n) return n;
    }
    return null;
}

const newest = (list) =>
    list.reduce((max, m) => Math.max(max, new Date(m.createdAt).getTime() || 0), 0);

export const workspaceService = {
    getWorkspace(token, teamId) {
        return request(`/teams/${encodeURIComponent(teamId)}/workspace`, token);
    },

    getMessages(token, teamId, params = {}) {
        const query = new URLSearchParams(params).toString();
        return request(
            `/teams/${encodeURIComponent(teamId)}/workspace/messages${query ? `?${query}` : ""}`,
            token
        );
    },

    // REST fallback; the UI sends through the socket.
    sendMessage(token, teamId, content) {
        return request(`/teams/${encodeURIComponent(teamId)}/workspace/messages`, token, {
            method: "POST",
            body: JSON.stringify({ content }),
        });
    },

    /**
     * Loads the newest page of history. The API returns each page oldest-first, but it
     * doesn't say whether page 1 is the newest or the oldest page, so we check once
     * and remember the direction for "load older".
     */
    async fetchLatestMessages(token, teamId, limit = 30) {
        const first = await this.getMessages(token, teamId, { page: 1, limit });
        let list = (first.data?.messages || []).map(normalizeMessage).filter(Boolean);
        const totalPages = first.data?.pagination?.totalPages || 1;
        let direction = 1;
        let olderPage = totalPages > 1 ? 2 : null;

        if (totalPages > 1) {
            const last = await this.getMessages(token, teamId, { page: totalPages, limit });
            const lastList = (last.data?.messages || []).map(normalizeMessage).filter(Boolean);
            if (newest(lastList) > newest(list)) {
                list = lastList;
                direction = -1;
                olderPage = totalPages - 1;
            }
        }

        return { messages: list, direction, olderPage };
    },
};

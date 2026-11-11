import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { teamService } from "../services/teamService";
import {
    normalizeMessage,
    pickMessage,
    workspaceService,
} from "../services/workspaceService";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket";
import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import ChatWindow from "../components/workspace/ChatWindow";
import "../styles/workspace.css";

const PAGE_SIZE = 30;

// Merge by id (so the ack and the broadcast never show a message twice), oldest first.
function mergeMessages(prev, incoming) {
    const map = new Map(prev.map((m) => [m.id, m]));
    incoming.forEach((m) => m && map.set(m.id, { ...map.get(m.id), ...m }));
    return [...map.values()].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
}

function Workspace() {
    const { teamId } = useParams();
    const { token, student, logout } = useAuth();

    const [team, setTeam] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [messages, setMessages] = useState([]);
    const [olderPage, setOlderPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [failure, setFailure] = useState(null);
    const [teamOpen, setTeamOpen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const direction = useRef(1);

    const addMessage = useCallback((raw) => {
        const m = normalizeMessage(raw);
        if (m) setMessages((prev) => mergeMessages(prev, [m]));
    }, []);

    // After a dropped connection, fetch anything we missed.
    const handleReconnect = useCallback(async () => {
        try {
            const latest = await workspaceService.fetchLatestMessages(token, teamId, PAGE_SIZE);
            setMessages((prev) => mergeMessages(prev, latest.messages));
        } catch {
            /* the socket keeps delivering new messages anyway */
        }
    }, [token, teamId]);

    const { status, error: socketError, sendMessage } = useWorkspaceSocket({
        token,
        teamId,
        onMessage: addMessage,
        onReconnect: handleReconnect,
    });

    useEffect(() => {
        if (!token || !teamId) return undefined;
        let active = true;

        async function load() {
            setLoading(true);
            setFailure(null);
            try {
                const [teamRes, wsRes] = await Promise.all([
                    teamService.getTeamById(token, teamId),
                    workspaceService.getWorkspace(token, teamId),
                ]);
                const latest = await workspaceService.fetchLatestMessages(token, teamId, PAGE_SIZE);
                if (!active) return;

                setTeam(teamRes.data);
                setWorkspace(wsRes.data?.workspace || wsRes.data);
                setMessages(mergeMessages([], latest.messages));
                direction.current = latest.direction;
                setOlderPage(latest.olderPage);
            } catch (err) {
                if (!active) return;
                if (err.status === 401) logout();
                setFailure({ status: err.status, message: err.message });
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [token, teamId, reloadKey, logout]);

    async function handleLoadOlder() {
        if (olderPage == null || loadingOlder) return;
        setLoadingOlder(true);
        try {
            const res = await workspaceService.getMessages(token, teamId, {
                page: olderPage,
                limit: PAGE_SIZE,
            });
            const list = (res.data?.messages || []).map(normalizeMessage).filter(Boolean);
            const total = res.data?.pagination?.totalPages || 1;
            const next = direction.current === -1 ? olderPage - 1 : olderPage + 1;

            setMessages((prev) => mergeMessages(prev, list));
            setOlderPage(next >= 1 && next <= total ? next : null);
        } finally {
            setLoadingOlder(false);
        }
    }

    const handleSend = useCallback(
        async (content) => {
            const res = await sendMessage(content);
            const saved = pickMessage(res);
            if (saved) addMessage(saved); // dedupes against the broadcast by id
        },
        [sendMessage, addMessage]
    );

    if (loading) {
        return (
            <div className="ws-state" role="status">
                <span className="app-spinner" aria-hidden="true" />
                Opening workspace...
            </div>
        );
    }

    if (failure) {
        const denied = failure.status === 401 || failure.status === 403;
        const missing = failure.status === 404;
        return (
            <div className="ws-state ws-state-card">
                <h1>
                    {denied && "You don't have access to this workspace"}
                    {missing && "Workspace not found"}
                    {!denied && !missing && "Couldn't open the workspace"}
                </h1>
                <p>
                    {denied && "Only current members of this team can open its workspace."}
                    {missing && "This team or its workspace doesn't exist."}
                    {!denied && !missing && failure.message}
                </p>
                <div className="ws-state-actions">
                    <Link to="/projects" className="btn btn-outline">Browse projects</Link>
                    {!denied && !missing && (
                        <button type="button" className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
                            Try again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const members = team?.members || [];

    return (
        <section className="ws">
            <WorkspaceHeader
                team={team}
                teamId={teamId}
                workspace={workspace}
                status={status}
                memberCount={members.length}
                teamOpen={teamOpen}
                onToggleTeam={() => setTeamOpen((v) => !v)}
            />

            <div className="ws-body">
                <WorkspaceSidebar members={members} currentId={student?.id} open={teamOpen} />
                <ChatWindow
                    messages={messages}
                    currentId={student?.id}
                    status={status}
                    error={socketError}
                    hasOlder={olderPage != null}
                    loadingOlder={loadingOlder}
                    onLoadOlder={handleLoadOlder}
                    onSend={handleSend}
                />
            </div>
        </section>
    );
}

export default Workspace;

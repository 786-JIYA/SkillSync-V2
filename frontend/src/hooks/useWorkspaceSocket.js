import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../services/workspaceService";

/**
 * One socket per (token, teamId). Joins the workspace room, forwards incoming
 * messages, rejoins after reconnects, and leaves + disconnects on cleanup.
 * status: connecting | connected | disconnected | denied | error
 */
export function useWorkspaceSocket({ token, teamId, onMessage, onReconnect }) {
    const socketRef = useRef(null);
    const handlers = useRef({ onMessage, onReconnect });
    const [status, setStatus] = useState("connecting");
    const [error, setError] = useState("");

    // keep the latest callbacks without reconnecting
    useEffect(() => {
        handlers.current = { onMessage, onReconnect };
    });

    useEffect(() => {
        if (!token || !teamId) return undefined;

        let joinedBefore = false;
        const socket = io(SOCKET_URL, { auth: { token } });
        socketRef.current = socket;
        setStatus("connecting");
        setError("");

        const join = () => {
            socket.emit("workspace:join", { teamId }, (res) => {
                if (res?.success) {
                    setStatus("connected");
                    setError("");
                    if (joinedBefore) handlers.current.onReconnect?.();
                    joinedBefore = true;
                } else {
                    setStatus("denied");
                    setError(res?.message || "You cannot join this workspace.");
                }
            });
        };
        const handleMessage = (message) => handlers.current.onMessage?.(message);
        const handleConnectError = (err) => {
            setStatus("error");
            setError(err?.message || "Unable to connect to chat.");
        };
        const handleDisconnect = (reason) => {
            if (reason !== "io client disconnect") setStatus("disconnected");
        };

        socket.on("connect", join);
        socket.on("workspace:new_message", handleMessage);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", join);
            socket.off("workspace:new_message", handleMessage);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);
            if (socket.connected) socket.emit("workspace:leave", { teamId });
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, teamId]);

    const sendMessage = useCallback(
        (content) =>
            new Promise((resolve, reject) => {
                const socket = socketRef.current;
                if (!socket || !socket.connected) {
                    reject(new Error("You're offline. Reconnecting..."));
                    return;
                }
                socket
                    .timeout(10000)
                    .emit("workspace:send_message", { teamId, content }, (err, res) => {
                        if (err) return reject(new Error("The server took too long to respond."));
                        if (!res?.success) {
                            return reject(new Error(res?.message || "Message could not be sent."));
                        }
                        return resolve(res);
                    });
            }),
        [teamId]
    );

    return { status, error, sendMessage };
}

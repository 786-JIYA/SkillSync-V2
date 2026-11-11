import { useEffect, useLayoutEffect, useRef } from "react";
import MessageItem from "./MessageItem";

const dayKey = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toDateString();
};

function dayLabel(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function MessageList({ messages, currentId, hasOlder, loadingOlder, onLoadOlder }) {
    const listRef = useRef(null);
    const stickRef = useRef(true);      // is the reader at the bottom?
    const prevHeight = useRef(null);    // set while older messages are loading

    function handleScroll() {
        const el = listRef.current;
        stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }

    function handleLoadOlder() {
        prevHeight.current = listRef.current.scrollHeight;
        onLoadOlder();
    }

    useLayoutEffect(() => {
        const el = listRef.current;
        if (!el) return;
        const last = messages[messages.length - 1];
        const sentByMe = last && last.senderId === currentId;

        if (prevHeight.current !== null) {
            el.scrollTop = el.scrollHeight - prevHeight.current; // keep place after prepending
            prevHeight.current = null;
        } else if (stickRef.current || sentByMe) {
            el.scrollTop = el.scrollHeight;
        }
    }, [messages, currentId]);

    useEffect(() => {
        if (!loadingOlder) prevHeight.current = null;
    }, [loadingOlder]);

    return (
        <div className="ws-list" ref={listRef} onScroll={handleScroll}>
            {hasOlder && (
                <button
                    type="button"
                    className="ws-older"
                    onClick={handleLoadOlder}
                    disabled={loadingOlder}
                >
                    {loadingOlder ? "Loading..." : "Load earlier messages"}
                </button>
            )}

            {messages.length === 0 ? (
                <div className="ws-empty">
                    <strong>No messages yet</strong>
                    <p>Say hello to your team to get things started.</p>
                </div>
            ) : (
                <ul aria-live="polite" aria-label="Chat messages">
                    {messages.map((m, i) => {
                        const prev = messages[i - 1];
                        const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                        const showName = newDay || prev.senderId !== m.senderId;
                        return (
                            <li key={m.id} className="ws-row">
                                {newDay && <p className="ws-day">{dayLabel(m.createdAt)}</p>}
                                <MessageItem
                                    message={m}
                                    mine={m.senderId === currentId}
                                    showName={showName}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default MessageList;

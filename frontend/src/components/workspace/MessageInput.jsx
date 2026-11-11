import { useState } from "react";
import { MESSAGE_LIMIT } from "../../services/workspaceService";

function MessageInput({ onSend, disabled }) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const trimmed = text.trim();
    const canSend = trimmed.length > 0 && !sending && !disabled;

    async function submit() {
        if (!canSend) return;
        setSending(true);
        setError("");
        try {
            await onSend(trimmed);
            setText("");
        } catch (err) {
            setError(err.message || "Message could not be sent.");
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }

    return (
        <div className="ws-input">
            {error && <p className="ws-input-error" role="alert">{error}</p>}

            <div className="ws-input-row">
                <label htmlFor="ws-message" className="ws-sr">Message</label>
                <textarea
                    id="ws-message"
                    rows={1}
                    value={text}
                    maxLength={MESSAGE_LIMIT}
                    placeholder={disabled ? "Chat is unavailable right now" : "Write a message..."}
                    onChange={(e) => { setText(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <button type="button" className="btn btn-primary" onClick={submit} disabled={!canSend}>
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>

            <p className="ws-input-hint">
                Enter to send, Shift+Enter for a new line
                {text.length > MESSAGE_LIMIT - 200 && (
                    <span> &middot; {text.length}/{MESSAGE_LIMIT}</span>
                )}
            </p>
        </div>
    );
}

export default MessageInput;

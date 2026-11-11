import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

function ChatWindow({ messages, currentId, status, error, hasOlder, loadingOlder, onLoadOlder, onSend }) {
    const offline = status !== "connected";

    return (
        <section className="ws-chat" aria-label="Group chat">
            {offline && (
                <p className={`ws-banner ${status === "connecting" || status === "disconnected" ? "is-warn" : "is-danger"}`} role="status">
                    {status === "connecting" && "Connecting to chat..."}
                    {status === "disconnected" && "Connection lost. Reconnecting..."}
                    {(status === "error" || status === "denied") && (error || "Chat is unavailable.")}
                </p>
            )}

            <MessageList
                messages={messages}
                currentId={currentId}
                hasOlder={hasOlder}
                loadingOlder={loadingOlder}
                onLoadOlder={onLoadOlder}
            />

            <MessageInput onSend={onSend} disabled={offline} />
        </section>
    );
}

export default ChatWindow;

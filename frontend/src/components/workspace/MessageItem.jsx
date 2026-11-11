const formatTime = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? ""
        : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

function MessageItem({ message, mine, showName }) {
    return (
        <div className={`ws-msg ${mine ? "is-mine" : ""}`}>
            <div className="ws-bubble">
                {showName && !mine && <strong className="ws-sender">{message.senderName}</strong>}
                <p>{message.content}</p>
                <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            </div>
        </div>
    );
}

export default MessageItem;

import { useEffect, useRef, useState } from "react";

function ChatBox({ currentUser, selectedUser, messages, onSendMessage, sending }) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.trim()) {
      return;
    }

    onSendMessage(draft);
    setDraft("");
  };

  if (!selectedUser) {
    return (
      <section className="chat-panel empty-state">
        <div>
          <p className="eyebrow">Chat workspace</p>
          <h2>Select a person to begin</h2>
          <p>Your message history will load here, and new messages will arrive instantly.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-panel">
      <header className="chat-header">
        <div>
          <p className="eyebrow">Conversation</p>
          <h2>{selectedUser.username}</h2>
        </div>
      </header>

      <div className="message-list" ref={scrollRef}>
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUser.id;

          return (
            <article key={message.id} className={`message-bubble ${isOwn ? "own" : ""}`}>
              <p>{message.message}</p>
              <span>{new Date(message.created_at).toLocaleString()}</span>
            </article>
          );
        })}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <input
          placeholder={`Message ${selectedUser.username}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="primary-button" type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default ChatBox;

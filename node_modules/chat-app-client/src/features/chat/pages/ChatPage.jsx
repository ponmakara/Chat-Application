import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { setAuthToken } from "../../../lib/api";
import { connectSocket, disconnectSocket, getSocket } from "../../../lib/socket";
import {
  fetchCurrentUser,
  updateCurrentUserRequest,
  uploadCurrentUserAvatarRequest
} from "../../users/services/user.service";
import {
  deleteMessageRequest,
  fetchConversations,
  fetchMessages,
  fetchUsers,
  sendMessageRequest
} from "../services/chat.service";

const NAV_ITEMS = [
  { id: "chats", label: "Chats" },
  { id: "contacts", label: "Contacts" },
  { id: "settings", label: "Settings" }
];

const CONVERSATION_FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "active", label: "Active" }
];

const EMOJI_OPTIONS = [
  "😀",
  "😄",
  "😂",
  "😊",
  "😍",
  "😘",
  "😎",
  "😢",
  "😡",
  "👍",
  "🙏",
  "👏",
  "🔥",
  "❤️",
  "🎉",
  "💯"
];

const CHAT_EMOJI_OPTIONS = [
  "\u{1F600}",
  "\u{1F603}",
  "\u{1F604}",
  "\u{1F601}",
  "\u{1F606}",
  "\u{1F605}",
  "\u{1F602}",
  "\u{1F923}",
  "\u{1F60A}",
  "\u{1F607}",
  "\u{1F642}",
  "\u{1F609}",
  "\u{1F60D}",
  "\u{1F970}",
  "\u{1F618}",
  "\u{1F617}",
  "\u{1F61C}",
  "\u{1F61D}",
  "\u{1F61B}",
  "\u{1F60E}",
  "\u{1F929}",
  "\u{1F914}",
  "\u{1F928}",
  "\u{1F610}",
  "\u{1F62D}",
  "\u{1F622}",
  "\u{1F625}",
  "\u{1F624}",
  "\u{1F621}",
  "\u{1F620}",
  "\u{1F631}",
  "\u{1F62E}",
  "\u{1F44B}",
  "\u{1F44C}",
  "\u{1F44D}",
  "\u{1F44E}",
  "\u{1F44F}",
  "\u{1F64C}",
  "\u{1F64F}",
  "\u{1F4AA}",
  "\u{2764}\u{FE0F}",
  "\u{1F499}",
  "\u{1F49A}",
  "\u{1F49B}",
  "\u{1F49C}",
  "\u{1F495}",
  "\u{1F494}",
  "\u{1F48C}",
  "\u{1F525}",
  "\u{2728}",
  "\u{1F389}",
  "\u{1F38A}",
  "\u{1F381}",
  "\u{1F3C6}",
  "\u{1F4AF}",
  "\u{2705}",
  "\u{2600}\u{FE0F}",
  "\u{1F319}",
  "\u{2B50}",
  "\u{26A1}",
  "\u{1F37B}",
  "\u{2615}",
  "\u{1F355}",
  "\u{1F339}"
];

const ICONS = {
  chats: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5h16v10H8l-4 4v-14Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9h8M8 12h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  contacts: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 18c1.7-2.8 4-4.2 6.5-4.2 2.6 0 4.8 1.4 6.5 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.8 13.4v-2.8l2-0.5a5.8 5.8 0 0 1 0.7-1.6L6.3 6.7l2-2 1.8 1.2c0.5-0.3 1-0.5 1.6-0.7l0.5-2h2.8l0.5 2c0.6 0.2 1.1 0.4 1.6 0.7l1.8-1.2 2 2-1.2 1.8c0.3 0.5 0.5 1 0.7 1.6l2 0.5v2.8l-2 0.5c-0.2 0.6-0.4 1.1-0.7 1.6l1.2 1.8-2 2-1.8-1.2c-0.5 0.3-1 0.5-1.6 0.7l-0.5 2h-2.8l-0.5-2a5.8 5.8 0 0 1-1.6-0.7l-1.8 1.2-2-2 1.2-1.8a5.8 5.8 0 0 1-0.7-1.6l-2-0.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.7 4.8c0.8-0.8 2.1-0.8 2.9 0l1.4 1.4c0.7 0.7 0.8 1.8 0.2 2.6l-1.1 1.4c1 2 2.6 3.7 4.6 4.6l1.4-1.1c0.8-0.6 1.9-0.5 2.6 0.2l1.4 1.4c0.8 0.8 0.8 2.1 0 2.9l-1 1c-0.9 0.9-2.2 1.2-3.4 0.8-6.1-1.9-10.9-6.7-12.8-12.8-0.4-1.2-0.1-2.5 0.8-3.4l1-1Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="6.5" width="11" height="11" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m14.5 10 5-2.5v9l-5-2.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1.8" fill="currentColor" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      <circle cx="12" cy="19" r="1.8" fill="currentColor" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M9 7V5.5h6V7M8.5 10.5v6M15.5 10.5v6M7.5 7l.7 11a2 2 0 0 0 2 1.9h3.6a2 2 0 0 0 2-1.9l.7-11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  smile: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8.5 14c1.2 1.4 2.4 2 3.5 2s2.3-0.6 3.5-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19 20 12 4 5l2.5 7L4 19Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6.5 12H20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 7V5.5A2.5 2.5 0 0 0 11.5 3h-5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h5a2.5 2.5 0 0 0 2.5-2.5V17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m10.5 12 9 0M16.5 8.5 20 12l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

const availabilityLabels = {
  available: "Available",
  away: "Away",
  offline: "Offline"
};

const statusColors = {
  available: "#28c76f",
  away: "#ff9f43",
  offline: "#d6dce8"
};

const displayNameOf = (person) => person?.display_name || person?.username || "Unknown";

const getPresenceStatus = (person, onlineUserIds) => {
  if (!person || !onlineUserIds.includes(person.id)) {
    return "offline";
  }

  return person.availability_status === "away" ? "away" : "available";
};

const getPresenceLabel = (person, onlineUserIds) => {
  const status = getPresenceStatus(person, onlineUserIds);

  if (status === "available") {
    return "Active now";
  }

  return availabilityLabels[status] || "Offline";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const getAvatarTone = (seed = "") => {
  const palettes = [
    ["#dfeeff", "#1d4ed8"],
    ["#ffe9d6", "#ea580c"],
    ["#efe4ff", "#7c3aed"],
    ["#dcfce7", "#15803d"],
    ["#ffe0eb", "#be185d"]
  ];
  const hash = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

const formatConversationTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? formatTime(value)
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

function normalizeProfile(user) {
  return {
    ...user,
    display_name: user.display_name || user.username,
    profile_image_url: user.profile_image_url || "",
    headline: user.headline || "",
    availability_status: user.availability_status || "available",
    profile_visibility: user.profile_visibility || "contacts",
    push_notifications: Boolean(user.push_notifications),
    email_digest: Boolean(user.email_digest),
    two_factor_enabled: Boolean(user.two_factor_enabled),
    blocked_count: Number(user.blocked_count || 0)
  };
}

function Avatar({ name, imageUrl = "", size = "md", showDot = false, status = "offline" }) {
  const [bg, fg] = getAvatarTone(name);

  return (
    <div className={`avatar avatar-${size}`} style={{ "--avatar-bg": bg, "--avatar-fg": fg }}>
      {imageUrl ? <img src={imageUrl} alt={name} className="avatar-image" /> : <span>{getInitials(name)}</span>}
      {showDot ? <i className="avatar-dot" style={{ backgroundColor: statusColors[status] }} /> : null}
    </div>
  );
}

function AppNavigation({ activeView, onChangeView, currentUser, onLogout }) {
  return (
    <aside className="messenger-rail">
      <div className="brand-block">
        <h1>Messenger</h1>
        <p>Active Now</p>
      </div>

      <nav className="rail-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`rail-link ${activeView === item.id ? "active" : ""}`}
            onClick={() => onChangeView(item.id)}
          >
            <span className="icon-shell">{ICONS[item.id]}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="rail-profile">
        <div className="rail-profile-main">
          <Avatar
            name={displayNameOf(currentUser)}
            imageUrl={currentUser.profile_image_url}
            size="md"
            showDot
            status={currentUser.availability_status || "available"}
          />
          <div>
            <strong>{displayNameOf(currentUser)}</strong>
            <span>{availabilityLabels[currentUser.availability_status || "available"]}</span>
          </div>
        </div>
        <button className="rail-logout" onClick={onLogout} title="Sign out">
          {ICONS.logout}
        </button>
      </div>
    </aside>
  );
}

function ChatView(props) {
  const {
    currentUser,
    conversations,
    selectedUser,
    messages,
    draft,
    sending,
    deletingMessageId,
    searchTerm,
    activeFilter,
    onSearchChange,
    onSelectUser,
    onFilterChange,
    onBackToConversations,
    onDraftChange,
    onSendMessage,
    onDeleteMessage,
    onlineUserIds,
    isSelectedUserTyping,
    isThreadOpen
  } = props;

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!emojiPickerRef.current?.contains(event.target)) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }
    onSendMessage(draft);
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? draft.length;
    const end = input?.selectionEnd ?? draft.length;
    const nextDraft = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;

    onDraftChange(nextDraft);
    requestAnimationFrame(() => {
      input?.focus();
      const cursorPosition = start + emoji.length;
      input?.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  const handleFilePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    onDraftChange(`${draft}${draft ? " " : ""}\u{1F4CE} ${file.name}`);
    event.target.value = "";
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const notifyUnavailable = (label) => {
    window.alert(`${label} is not available in this demo yet.`);
  };

  return (
    <section className={`messenger-main ${isThreadOpen ? "mobile-thread-open" : ""}`}>
      <div className="conversation-pane">
        <div className="search-box">
          <span className="search-icon">{ICONS.search}</span>
          <input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="filter-pills">
          {CONVERSATION_FILTERS.map((filter) => (
            <button
              key={filter.id}
              className={`pill ${activeFilter === filter.id ? "active" : ""}`}
              onClick={() => onFilterChange(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => {
            const isOnline = onlineUserIds.includes(conversation.id);
            const isSelected = selectedUser?.id === conversation.id;
            const presenceStatus = getPresenceStatus(conversation, onlineUserIds);
            const presenceLabel = getPresenceLabel(conversation, onlineUserIds);

            return (
              <button
                key={conversation.id}
                className={`conversation-card ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectUser(conversation)}
              >
                <Avatar
                  name={displayNameOf(conversation)}
                  imageUrl={conversation.profile_image_url}
                  size="lg"
                  showDot
                  status={presenceStatus}
                />
                <div className="conversation-copy">
                  <div className="conversation-row">
                    <strong>{displayNameOf(conversation)}</strong>
                    <span>{formatConversationTime(conversation.last_message_at) || presenceLabel}</span>
                  </div>
                  <p>
                    <span className={`presence-text ${isOnline ? "online" : ""}`}>{presenceLabel}</span>
                    <span>{conversation.last_message || conversation.headline || "Start a conversation"}</span>
                  </p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 ? (
            <div className="empty-list-note">
              <strong>No conversations found</strong>
              <span>Try another search or filter.</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="thread-panel">
        {selectedUser ? (
          <>
            <header className="thread-header">
              <button
                type="button"
                className="mobile-back-button"
                onClick={onBackToConversations}
                aria-label="Back to conversations"
              >
                {ICONS.back}
              </button>
              <div className="thread-identity">
                <Avatar
                  name={displayNameOf(selectedUser)}
                  imageUrl={selectedUser.profile_image_url}
                  size="lg"
                  showDot
                  status={getPresenceStatus(selectedUser, onlineUserIds)}
                />
                <div>
                  <strong>{displayNameOf(selectedUser)}</strong>
                  <span>{getPresenceLabel(selectedUser, onlineUserIds)}</span>
                </div>
              </div>

              <div className="thread-actions">
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => notifyUnavailable("Voice call")}
                  title="Voice call"
                >
                  {ICONS.phone}
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => notifyUnavailable("Video call")}
                  title="Video call"
                >
                  {ICONS.video}
                </button>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => notifyUnavailable("More actions")}
                  title="More actions"
                >
                  {ICONS.more}
                </button>
              </div>
            </header>

            <div className="message-stage" ref={scrollRef}>
              <div className="day-divider">Today</div>
              {messages.map((message) => {
                const isOwn = message.sender_id === currentUser.id;
                return (
                  <article key={message.id} className={`thread-message ${isOwn ? "own" : ""}`}>
                    {!isOwn ? <Avatar name={displayNameOf(selectedUser)} imageUrl={selectedUser.profile_image_url} size="sm" /> : null}
                    <div className="message-stack">
                      <div className={`message-card ${isOwn ? "own" : ""}`}>
                        <p>{message.message}</p>
                      </div>
                      <div className={`message-meta ${isOwn ? "own" : ""}`}>
                        <span className="message-time">{formatTime(message.created_at)}</span>
                        {isOwn ? (
                          <button
                            type="button"
                            className="message-delete"
                            onClick={() => onDeleteMessage(message.id)}
                            disabled={deletingMessageId === message.id}
                            title="Delete message"
                          >
                            {ICONS.trash}
                            <span>{deletingMessageId === message.id ? "Deleting..." : "Delete"}</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}

              {selectedUser && isSelectedUserTyping ? (
                <div className="typing-row">
                  <div className="typing-pill">
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>{displayNameOf(selectedUser)} is typing...</small>
                </div>
              ) : null}
            </div>

            <div className="composer-wrap">
              <form className="message-composer" onSubmit={handleSubmit}>
                <button
                  type="button"
                  className="composer-icon-button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                >
                  {ICONS.plus}
                </button>
                <input
                  ref={fileInputRef}
                  className="hidden-file-input"
                  type="file"
                  onChange={handleFilePick}
                />
                <input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(event) => onDraftChange(event.target.value)}
                />
                <div className="emoji-picker-wrap" ref={emojiPickerRef}>
                  <button
                    type="button"
                    className={`composer-icon-button emoji-toggle ${isEmojiPickerOpen ? "active" : ""}`}
                    onClick={() => setIsEmojiPickerOpen((current) => !current)}
                    aria-label="Choose emoji"
                    aria-expanded={isEmojiPickerOpen}
                  >
                    {ICONS.smile}
                  </button>
                  {isEmojiPickerOpen ? (
                    <div className="emoji-picker" role="menu" aria-label="Emoji picker">
                      {CHAT_EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="emoji-option"
                          onClick={() => handleEmojiSelect(emoji)}
                          role="menuitem"
                          aria-label={`Insert ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button className="send-button" type="submit" disabled={sending}>
                  {ICONS.send}
                </button>
              </form>

              <div className="composer-footer">
                <span>CTRL + ENTER TO SEND</span>
                <span>END-TO-END ENCRYPTED</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-thread">
            <h2>Select a conversation</h2>
            <p>Choose a contact from the left to start messaging in real time.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactsView({ users, onlineUserIds, searchTerm, onSearchChange, onOpenChat }) {
  const recentlyActive = users.slice(0, 5);

  return (
    <section className="contacts-view">
      <div className="contacts-toolbar">
        <div className="search-box">
          <span className="search-icon">{ICONS.search}</span>
          <input
            placeholder="Search contacts by name or email..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className="contacts-section-head">
        <h2>Recently Active</h2>
        <button className="text-link">View All</button>
      </div>

      <div className="recent-grid">
        {recentlyActive.map((person) => {
          const presenceLabel = getPresenceLabel(person, onlineUserIds);

          return (
            <div key={person.id} className="recent-card">
              <Avatar
                name={displayNameOf(person)}
                imageUrl={person.profile_image_url}
                size="xl"
                showDot
                status={getPresenceStatus(person, onlineUserIds)}
              />
              <strong>{displayNameOf(person)}</strong>
              <span>{presenceLabel}</span>
            </div>
          );
        })}
      </div>

      <div className="contacts-table">
        <div className="contacts-table-head">
          <h3>All Contacts</h3>
          <span className="contacts-count">{users.length}</span>
        </div>

        <div className="contacts-list-table">
          <div className="contacts-row head">
            <span>Contact</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {users.map((person) => {
            const presenceStatus = getPresenceStatus(person, onlineUserIds);
            const presenceLabel = getPresenceLabel(person, onlineUserIds);

            return (
              <div key={person.id} className="contacts-row">
                <div className="contact-person">
                  <Avatar
                    name={displayNameOf(person)}
                    imageUrl={person.profile_image_url}
                    size="md"
                    showDot
                    status={presenceStatus}
                  />
                  <div>
                    <strong>{displayNameOf(person)}</strong>
                    <span>{person.headline || person.email}</span>
                  </div>
                </div>

                <span className={`contact-status ${presenceStatus === "available" ? "online" : ""}`}>
                  {presenceLabel}
                </span>

                <div className="contact-actions">
                  <button className="message-action" onClick={() => onOpenChat(person)}>
                    Message
                  </button>
                  <button className="icon-button compact">{ICONS.phone}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SettingsView({ currentUser, saving, saveMessage, onSaveProfile, onLogout }) {
  const [form, setForm] = useState(() => normalizeProfile(currentUser));
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(normalizeProfile(currentUser));
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSaveProfile(form);
  };

  const handleAvatarPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onSaveProfile(form, file);
    event.target.value = "";
  };

  return (
    <section className="settings-view">
      <header className="settings-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your account preferences and security</p>
        </div>
        <button className="secondary-button">Help Center</button>
      </header>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="profile-card">
          <div className="profile-main">
            <Avatar
              name={form.display_name}
              imageUrl={form.profile_image_url}
              size="xl"
              showDot
              status={form.availability_status}
            />
            <div>
              <h3>{form.display_name}</h3>
              <p>{form.email}</p>
              <span className="availability-chip">{availabilityLabels[form.availability_status]}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="message-action" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Profile"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </button>
            <input
              ref={fileInputRef}
              className="hidden-file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarPick}
            />
          </div>
        </div>

        <div className="settings-card">
          <h4>Profile Details</h4>
          <div className="settings-grid">
            <label>
              Display name
              <input name="display_name" value={form.display_name} onChange={handleChange} />
            </label>
            <label>
              Username
              <input name="username" value={form.username} onChange={handleChange} />
            </label>
            <label>
              Email address
              <input name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
              Headline
              <input
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="Senior Product Designer"
              />
            </label>
            <label>
              Availability
              <select
                className="settings-select"
                name="availability_status"
                value={form.availability_status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <label>
              Profile visibility
              <select
                className="settings-select"
                name="profile_visibility"
                value={form.profile_visibility}
                onChange={handleChange}
              >
                <option value="contacts">Contacts only</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h4>Account & Security</h4>
          <div className="setting-row">
            <div>
              <strong>Email Address</strong>
              <span>{form.email}</span>
            </div>
            <small>Verified</small>
          </div>
          <div className="setting-row">
            <div>
              <strong>Security & Password</strong>
              <span>
                Last password change:{" "}
                {currentUser.last_password_change_at
                  ? new Date(currentUser.last_password_change_at).toLocaleDateString()
                  : "Not available"}
              </span>
            </div>
            <small>Protected</small>
          </div>
          <div className="setting-row">
            <div>
              <strong>Two-Factor Authentication</strong>
              <span>
                {currentUser.two_factor_enabled ? "Enabled on this account" : "Not enabled yet"}
              </span>
            </div>
            <small>{currentUser.two_factor_enabled ? "Enabled" : "Coming soon"}</small>
          </div>
        </div>

        <div className="settings-card">
          <h4>Preferences</h4>
          <label className="toggle-row">
            <div>
              <strong>Push Notifications</strong>
              <span>Alerts for new messages and activity</span>
            </div>
            <input
              type="checkbox"
              name="push_notifications"
              checked={form.push_notifications}
              onChange={handleChange}
            />
          </label>
          <label className="toggle-row">
            <div>
              <strong>Email Digests</strong>
              <span>Weekly summary of missed conversations</span>
            </div>
            <input
              type="checkbox"
              name="email_digest"
              checked={form.email_digest}
              onChange={handleChange}
            />
          </label>
          <div className="setting-row">
            <div>
              <strong>Blocked Users</strong>
              <span>Contacts restricted from reaching you</span>
            </div>
            <small>{currentUser.blocked_count || 0} blocked</small>
          </div>
        </div>

        {saveMessage ? <p className="settings-save-note">{saveMessage}</p> : null}

        <button className="sign-out-link" type="button" onClick={onLogout}>
          {ICONS.logout}
          <span>Sign Out</span>
        </button>
      </form>
    </section>
  );
}

function ChatPage() {
  const { user, token, updateUser, logout } = useAuth();
  const [activeView, setActiveView] = useState("chats");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [draft, setDraft] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [conversationFilter, setConversationFilter] = useState("all");
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [typingUserIds, setTypingUserIds] = useState([]);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const mergeUserCollection = (collection, updatedUser) =>
    collection.map((item) => (item.id === updatedUser.id ? { ...item, ...updatedUser } : item));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const loadDirectory = async () => {
      const [allUsers, conversationItems, me] = await Promise.all([
        fetchUsers(),
        fetchConversations(),
        fetchCurrentUser()
      ]);

      setUsers(allUsers);
      setConversations(conversationItems);
      updateUser(normalizeProfile(me));
      setSelectedUser((current) => {
        if (current) {
          return allUsers.find((item) => item.id === current.id) || current;
        }
        return conversationItems[0] || allUsers[0] || null;
      });
    };

    loadDirectory().catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }
    fetchMessages(selectedUser.id).then(setMessages).catch(console.error);
  }, [selectedUser]);

  useEffect(() => {
    const socket = getSocket();

    if (socket && selectedUser && isTypingRef.current) {
      socket.emit("typing:stop", { to: selectedUser.id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    isTypingRef.current = false;
  }, [selectedUser?.id]);

  useEffect(() => {
    const socket = connectSocket(token);
    if (!socket) {
      return undefined;
    }

    const refreshConversations = () => {
      fetchConversations().then(setConversations).catch(console.error);
      fetchUsers().then(setUsers).catch(console.error);
    };

    const handleOnlineUsers = (userIds) => setOnlineUserIds(userIds);

    const handleUserUpdated = (updatedUser) => {
      setUsers((current) => mergeUserCollection(current, updatedUser));
      setConversations((current) => mergeUserCollection(current, updatedUser));
      setSelectedUser((current) =>
        current?.id === updatedUser.id ? { ...current, ...updatedUser } : current
      );

      if (updatedUser.id === user.id) {
        updateUser(normalizeProfile(updatedUser));
      }
    };

    const handleNewMessage = (message) => {
      if (
        selectedUser &&
        [message.sender_id, message.receiver_id].includes(selectedUser.id) &&
        [message.sender_id, message.receiver_id].includes(user.id)
      ) {
        setMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, message]
        );
      }
      setTypingUserIds((current) => current.filter((userId) => userId !== message.sender_id));
      refreshConversations();
    };

    const handleDeletedMessage = (message) => {
      if (
        selectedUser &&
        [message.sender_id, message.receiver_id].includes(selectedUser.id) &&
        [message.sender_id, message.receiver_id].includes(user.id)
      ) {
        setMessages((current) => current.filter((item) => item.id !== message.id));
      }
      refreshConversations();
    };

    const handleTypingStart = ({ from }) => {
      setTypingUserIds((current) => (current.includes(from) ? current : [...current, from]));
    };

    const handleTypingStop = ({ from }) => {
      setTypingUserIds((current) => current.filter((userId) => userId !== from));
    };

    socket.on("users:online", handleOnlineUsers);
    socket.on("user:updated", handleUserUpdated);
    socket.on("message:new", handleNewMessage);
    socket.on("message:deleted", handleDeletedMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("users:online", handleOnlineUsers);
      socket.off("user:updated", handleUserUpdated);
      socket.off("message:new", handleNewMessage);
      socket.off("message:deleted", handleDeletedMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [selectedUser, token, updateUser, user.id]);

  useEffect(() => () => disconnectSocket(), []);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    []
  );

  const filteredConversations = useMemo(() => {
    const source = conversations.length > 0 ? conversations : users;
    const term = conversationSearch.trim().toLowerCase();
    const searched = term
      ? source.filter((item) =>
          [displayNameOf(item), item.email, item.last_message, item.headline]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        )
      : source;

    if (conversationFilter === "unread") {
      return searched.filter((item) => item.last_message && item.last_sender_id !== user.id);
    }

    if (conversationFilter === "active") {
      return searched.filter((item) => onlineUserIds.includes(item.id));
    }

    return searched;
  }, [conversations, users, conversationSearch, conversationFilter, onlineUserIds, user.id]);

  const filteredContacts = useMemo(() => {
    const term = contactSearch.trim().toLowerCase();
    if (!term) {
      return users;
    }
    return users.filter((item) =>
      [displayNameOf(item), item.email, item.headline]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [users, contactSearch]);

  const handleSendMessage = async (messageText) => {
    if (!selectedUser) {
      return;
    }
    try {
      setSending(true);
      const socket = getSocket();
      if (socket && isTypingRef.current) {
        socket.emit("typing:stop", { to: selectedUser.id });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      const message = await sendMessageRequest(selectedUser.id, messageText.trim());
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message]
      );
      setDraft("");
      const conversationItems = await fetchConversations();
      setConversations(conversationItems);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDraftChange = (value) => {
    setDraft(value);

    if (!selectedUser) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    if (!value.trim()) {
      if (isTypingRef.current) {
        socket.emit("typing:stop", { to: selectedUser.id });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    if (!isTypingRef.current) {
      socket.emit("typing:start", { to: selectedUser.id });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { to: selectedUser.id });
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 1200);
  };

  const handleSaveProfile = async (form, avatarFile = null) => {
    try {
      setSavingProfile(true);
      setSaveMessage("");
      let updated;

      if (avatarFile) {
        updated = normalizeProfile(await uploadCurrentUserAvatarRequest(avatarFile));
      } else {
        updated = normalizeProfile(await updateCurrentUserRequest(form));
      }

      updateUser(updated);
      setSaveMessage(avatarFile ? "Profile image uploaded successfully." : "Profile saved successfully.");
      const refreshedUsers = await fetchUsers();
      setUsers(refreshedUsers);
      const refreshedConversations = await fetchConversations();
      setConversations(refreshedConversations);
      setSelectedUser((current) =>
        current ? refreshedUsers.find((item) => item.id === current.id) || current : current
      );
    } catch (error) {
      setSaveMessage(error.response?.data?.message || "Unable to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenChat = (person) => {
    setSelectedUser(person);
    setIsThreadOpen(true);
    setActiveView("chats");
  };

  const handleSelectConversation = (person) => {
    setSelectedUser(person);
    setIsThreadOpen(true);
  };

  const handleChangeView = (view) => {
    setActiveView(view);
    if (view !== "chats") {
      setIsThreadOpen(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setDeletingMessageId(messageId);
      await deleteMessageRequest(messageId);
      setMessages((current) => current.filter((item) => item.id !== messageId));
      const conversationItems = await fetchConversations();
      setConversations(conversationItems);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    setAuthToken("");
    logout();
  };

  return (
    <main className="messenger-shell">
      <AppNavigation
        activeView={activeView}
        onChangeView={handleChangeView}
        currentUser={normalizeProfile(user)}
        onLogout={handleLogout}
      />

      {activeView === "chats" ? (
        <ChatView
          currentUser={normalizeProfile(user)}
          conversations={filteredConversations}
          selectedUser={selectedUser}
          messages={messages}
          draft={draft}
          sending={sending}
          deletingMessageId={deletingMessageId}
          searchTerm={conversationSearch}
          activeFilter={conversationFilter}
          onSearchChange={setConversationSearch}
          onSelectUser={handleSelectConversation}
          onFilterChange={setConversationFilter}
          onBackToConversations={() => setIsThreadOpen(false)}
          onDraftChange={handleDraftChange}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onlineUserIds={onlineUserIds}
          isSelectedUserTyping={selectedUser ? typingUserIds.includes(selectedUser.id) : false}
          isThreadOpen={isThreadOpen}
        />
      ) : null}

      {activeView === "contacts" ? (
        <ContactsView
          users={filteredContacts}
          onlineUserIds={onlineUserIds}
          searchTerm={contactSearch}
          onSearchChange={setContactSearch}
          onOpenChat={handleOpenChat}
        />
      ) : null}

      {activeView === "settings" ? (
        <SettingsView
          currentUser={normalizeProfile(user)}
          saving={savingProfile}
          saveMessage={saveMessage}
          onSaveProfile={handleSaveProfile}
          onLogout={handleLogout}
        />
      ) : null}
    </main>
  );
}

export default ChatPage;

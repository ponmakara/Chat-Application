function Sidebar({ users, selectedUser, onlineUserIds, onSelectUser, currentUser, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Signed in as</p>
          <h2>{currentUser?.username}</h2>
        </div>
        <button className="ghost-button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="user-list">
        {users.map((user) => {
          const isSelected = selectedUser?.id === user.id;
          const isOnline = onlineUserIds.includes(user.id);

          return (
            <button
              key={user.id}
              className={`user-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectUser(user)}
            >
              <div>
                <strong>{user.username}</strong>
                <span>{user.email}</span>
              </div>
              <span className={`presence ${isOnline ? "online" : ""}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;

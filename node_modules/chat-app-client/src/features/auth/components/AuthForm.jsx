import { useState } from "react";

function AuthForm({ mode, onSubmit, loading, error }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-card-topline">
        <span className="auth-card-badge">{isRegister ? "Create account" : "Welcome back"}</span>
        <span className="auth-card-status">Secure session</span>
      </div>

      <div className="auth-copy">
        <h1>{isRegister ? "Create your account" : "Login to your account"}</h1>
        <p>
          {isRegister
            ? "Set up your profile and start messaging your team with a clean, focused workspace."
            : "Access your messages, contacts, profile, and live conversations."}
        </p>
      </div>

      <div className="auth-preview-strip">
        <div className="auth-preview-avatars" aria-hidden="true">
          <span>A</span>
          <span>M</span>
          <span>J</span>
        </div>
        <div className="auth-preview-copy">
          <strong>{isRegister ? "Simple setup" : "Workspace ready"}</strong>
          <span>{isRegister ? "Create a profile and continue" : "Messages and presence stay synced"}</span>
        </div>
      </div>

      <div className="auth-form-grid">
        {isRegister && (
          <label className="auth-field">
            <span>Username</span>
            <input
              name="username"
              placeholder="makara"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required={isRegister}
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            placeholder={isRegister ? "Create a strong password" : "Enter your password"}
            value={form.password}
            onChange={handleChange}
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
      </button>

      <div className="auth-card-footer">
        <span>{isRegister ? "Profile setup takes less than a minute." : "Keep your conversations private and organized."}</span>
        <strong>{isRegister ? "Fast onboarding" : "Ready to chat"}</strong>
      </div>
    </form>
  );
}

export default AuthForm;

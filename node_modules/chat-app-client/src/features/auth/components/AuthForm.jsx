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
      <div className="auth-copy">
        <p className="eyebrow">Real-time messaging</p>
        <h1>{isRegister ? "Create your chat account" : "Welcome back"}</h1>
        <p>
          {isRegister
            ? "Start with secure auth, then move straight into one-to-one conversations."
            : "Sign in to see your contacts, presence status, and message history."}
        </p>
      </div>

      {isRegister && (
        <label>
          Username
          <input
            name="username"
            placeholder="jane"
            value={form.username}
            onChange={handleChange}
          />
        </label>
      )}

      <label>
        Email
        <input
          name="email"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={handleChange}
        />
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
      </button>
    </form>
  );
}

export default AuthForm;

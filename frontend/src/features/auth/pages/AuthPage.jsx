import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { loginRequest, registerRequest } from "../services/auth.service";
import { setAuthToken } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (form) => {
    try {
      setLoading(true);
      setError("");

      const action = mode === "register" ? registerRequest : loginRequest;
      const payload =
        mode === "register"
          ? form
          : {
              email: form.email,
              password: form.password
            };

      const result = await action(payload);
      setAuthToken(result.token);
      login(result);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} error={error} />
        <button
          className="mode-switch"
          onClick={() => {
            setMode((current) => (current === "login" ? "register" : "login"));
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </main>
  );
}

export default AuthPage;

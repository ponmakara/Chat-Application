import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const storageKey = "chat-app-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { user: null, token: "" };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(authState));
  }, [authState]);

  const login = ({ user, token }) => setAuthState({ user, token });
  const updateUser = (user) => setAuthState((current) => ({ ...current, user }));
  const logout = () => setAuthState({ user: null, token: "" });

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

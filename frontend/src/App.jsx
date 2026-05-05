import { useAuth } from "./context/AuthContext";
import AuthPage from "./features/auth/pages/AuthPage";
import ChatPage from "./features/chat/pages/ChatPage";

function App() {
  const { token } = useAuth();

  return token ? <ChatPage /> : <AuthPage />;
}

export default App;

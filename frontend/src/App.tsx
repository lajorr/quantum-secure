import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm, SignupForm } from "./features/auth";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ChatProvider } from "./features/chat/context/ChatContext";
import { WebSocketDemo } from "./features/websocket/WebSocketDemo";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <WebSocketDemo />
                // <ProtectedRoute>
                //   <ChatScreen />
                // </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;

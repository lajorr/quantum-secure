import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm, SignupForm } from "./features/auth";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ChatScreen } from "./features/chat";
import { ChatProvider } from "./features/chat/context/ChatContext";
import { ProtectedRoute } from "./layouts/protectedRoute";

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatScreen />
                </ProtectedRoute>
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

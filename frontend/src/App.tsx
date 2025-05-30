import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginForm, SignupForm } from "./features/auth";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ChatScreen } from "./features/chat";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatScreen />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

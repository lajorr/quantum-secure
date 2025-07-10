import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginForm, SignupForm } from './features/auth'
import { AuthProvider } from './features/auth/context/AuthContext'
import { ChatProvider } from './features/chat/context/ChatContext'
// import { WebSocketDemo } from "./features/websocket/WebSocketDemo";
import { ToastContainer } from 'react-toastify'
import { ChatScreen } from './features/chat'
import { ProtectedRoute } from './layouts/protectedRoute'
import { RSAProvider } from './features/chat/rsa_implement/RsaProvider'

function App() {
  return (
    <div>
      <ToastContainer autoClose={3000} />
      <AuthProvider>
        <RSAProvider>
          <ChatProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    // <WebSocketDemo />
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
        </RSAProvider>
      </AuthProvider>
    </div>
  )
}

export default App

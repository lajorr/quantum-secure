import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginForm, SignupForm } from './features/auth'
import { AuthProvider } from './features/auth/context/AuthContext'
import { ChatProvider } from './features/chat/context/ChatContext'
import { ToastContainer } from 'react-toastify'
import { ChatScreen } from './features/chat'
import SettingsPage from './features/chat/components/SettingsPage'
import ProfilePage from './features/chat/components/ProfilePage'
import { ProtectedRoute } from './layouts/protectedRoute'
import { RSAProvider } from './features/chat/rsa_implement/RsaProvider'
import ResetPassword from './features/auth/components/ResetPassword'

function App() {
  return (
    <>
      <ToastContainer
        autoClose={3000}
        position="top-right"
        toastClassName="rounded-xl shadow-lg"
      />
      <AuthProvider>
        <RSAProvider>
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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </RSAProvider>
      </AuthProvider>
    </>
  )
}

export default App

import { useChat } from '../context/ChatContext'
import SideNav from "../../../components/SideNav";

export default function ProfilePage() {
  const { currentUser } = useChat()

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      <SideNav />
      <div className="flex-1 p-8 text-teal-100">
        <h1 className="text-3xl font-semibold mb-6">Profile</h1>
        <div className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur">
          {currentUser ? (
            <div className="space-y-2">
              <div><span className="text-teal-200/70">Username:</span> {currentUser.username}</div>
              <div><span className="text-teal-200/70">User ID:</span> {currentUser.id}</div>
            </div>
          ) : (
            <p className="text-teal-200/80">No user loaded.</p>
          )}
        </div>
      </div>
    </div>
  )
}


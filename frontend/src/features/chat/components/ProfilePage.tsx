import { useChat } from '../context/ChatContext'
import SideNav from "../../../components/SideNav";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';

export default function ProfilePage() {
  const { currentUser } = useChat()

  const displayName = currentUser?.username || '—'
  const email = currentUser?.email || '—'

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      <SideNav />

      {/* Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* Left panel */}
        <div className="md:col-span-4 border-r border-white/10 bg-black/20 backdrop-blur p-10 text-teal-100">
          <h2 className="text-xl font-semibold mb-8">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center justify-start mb-10">
            <div className="h-28 w-28 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
              <PersonIcon className="text-teal-100" style={{ fontSize: 48 }} />
            </div>
          </div>

          {/* Name */}
          <div className="mb-8">
            <div className="text-sm text-teal-200/70 mb-2">Name</div>
            <div className="flex items-center justify-between">
              <div className="text-base">{displayName}</div>
              <button className="p-2 rounded hover:bg-white/10"><EditIcon fontSize="small" /></button>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="mb-8">
            <div className="text-sm text-teal-200/70 mb-2">Email</div>
            <div className="flex items-center justify-between">
              <div className="text-base">{email}</div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="md:col-span-8 flex items-center justify-center">
          <div className="text-center text-teal-100">
            <div className="h-24 w-24 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center mb-6">
              <PersonIcon className="text-teal-100" style={{ fontSize: 50 }} />
            </div>
            <h1 className="text-3xl font-semibold">Profile</h1>
          </div>
        </div>
      </div>
    </div>
  )
}


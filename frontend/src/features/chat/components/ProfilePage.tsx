import { useChat } from '../context/ChatContext'
import SideNav from "../../../components/SideNav";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { updateUser } from '../services/userServices'

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useChat()

  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(currentUser?.username || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  var displayName = currentUser?.username || '—'
  const email = currentUser?.email || '—'

  const handleStartEdit = () => {
    setError(null)
    setNewName(displayName)
    setIsEditingName(true)
  }

  const handleCancel = () => {
    setIsEditingName(false)
    setNewName(displayName)
    setError(null)
  }

  const handleSave = async () => {
    if (!currentUser?.id) return
    if (!newName.trim()) {
      setError('Name cannot be empty')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await updateUser(newName.trim())
      setCurrentUser({...currentUser!,
        username:newName}
      )
      setIsEditingName(false)
    } catch (e) {
      setError('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

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
            {/* If not editing, show the name and edit button */}
            {!isEditingName ? (
              <div className="flex items-center justify-between">
                <div className="text-base">{displayName}</div>
                <button className="p-2 rounded hover:bg-white/10" onClick={handleStartEdit} aria-label="Edit name"><EditIcon fontSize="small" /></button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-100"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                />
                {error && <div className="text-red-300 text-sm">{error}</div>}
                <div className="flex gap-2">
                  <button disabled={saving} onClick={handleSave} className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white">{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={handleCancel} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20">Cancel</button>
                </div>
              </div>
            )}
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


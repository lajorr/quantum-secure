import SideNav from "../../../components/SideNav";

export default function SettingsPage() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      <SideNav />
      <div className="flex-1 p-8 text-teal-100">
        <h1 className="text-3xl font-semibold mb-6">Settings</h1>
        <div className="bg-black/20 border border-white/10 rounded-xl p-6 backdrop-blur">
          <p className="text-teal-200/80">This is the settings page.</p>
        </div>
      </div>
    </div>
  )
}


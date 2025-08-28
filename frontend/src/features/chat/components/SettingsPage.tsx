import SideNav from "../../../components/SideNav";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LockResetIcon from '@mui/icons-material/LockReset';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "../../auth/context/AuthContext";
import { useState } from "react";

export default function SettingsPage() {
  const { logout } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = async () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      <SideNav />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12">
        {/* Left panel: settings list */}
        <div className="md:col-span-4 border-r border-white/10 bg-black/20 backdrop-blur p-10 text-teal-100">
          <h2 className="text-xl font-semibold mb-8">Settings</h2>

          <div className="space-y-4">
            <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3">
              <LockResetIcon fontSize="small" />
              <span>Change Password</span>
            </button>
            <button onClick={() => setShowAbout(true)} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3">
              <InfoOutlinedIcon fontSize="small" />
              <span>About Us</span>
            </button>

            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-100 flex items-center gap-3"
              >
                <LogoutIcon fontSize="small" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right panel: placeholder */}
        <div className="md:col-span-8 flex items-center justify-center">
          <div className="text-center text-teal-100">
            <div className="h-24 w-24 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center mb-6">
              <SettingsIcon className="text-teal-100" style={{ fontSize: 50 }} />
            </div>
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAbout(false)} />
          <div className="relative z-10 w-[90%] max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-teal-50 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">About Us</h3>
              <button
                className="p-2 rounded-lg hover:bg-white/10"
                onClick={() => setShowAbout(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-4 text-teal-100/90">
              <p>
              This project demonstrates the impact of quantum computing on classical encryption by simulating quantum attacks on RSA. Instead of implementing standard RSA directly, we use a simplified model to illustrate how Shor’s algorithm can break RSA when applied through a third-party quantum simulation framework. This approach highlights the weakness of classical public-key systems under quantum capabilities, even if large-scale quantum computers are not yet available.              </p>
              <p>
              To contrast this, the project also examines ML-KEM (Kyber), a post-quantum cryptographic scheme designed to resist quantum attacks. By comparing RSA’s vulnerability with the resilience of ML-KEM, the project raises awareness about the limitations of current cryptographic standards and the importance of adopting quantum-resistant algorithms for future security.              </p>
              <div className="pt-2">
                <div className="text-sm uppercase tracking-wide text-teal-200/80 mb-1">Team</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Rubin Lal Amatya</li>
                  <li>Salomi Airy</li>
                  <li>Rojal Bajracharya</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowAbout(false)} className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


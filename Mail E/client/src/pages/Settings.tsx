import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Mail, Shield, Lock } from "lucide-react";

export function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden border-l border-gray-200 bg-white">
      <div className="flex flex-col h-full p-6 max-w-md w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your MailE preferences</p>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={16} className="text-indigo-600" />
              Account
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-sm text-gray-900">{user?.email || "-"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Member since</label>
                <p className="text-sm text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-indigo-600" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Require master key on startup</p>
                  <p className="text-xs text-gray-500">Protect your credential vault automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={16} className="text-indigo-600" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Theme</p>
                  <p className="text-xs text-gray-500">Choose light or dark mode</p>
                </div>
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <Button variant="danger" className="w-full">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

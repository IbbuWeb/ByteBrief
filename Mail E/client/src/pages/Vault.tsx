import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Shield, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export function Vault() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (unlocked) loadCredentials();
  }, [unlocked]);

  async function loadCredentials() {
    try {
      const res = await api.get("/api/vault/credentials");
      setCredentials(res.data.credentials || []);
    } catch {
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }

  async function unlock() {
    if (!masterKey) {
      toast.error("Enter your master key");
      return;
    }
    localStorage.setItem("maile-master-key", masterKey);
    setUnlocked(true);
    await loadCredentials();
  }

  if (!unlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-6">
            <Shield className="w-8 h-8 text-indigo-600 mb-3" />
            <h2 className="text-xl font-bold text-gray-900">Credential Vault</h2>
            <p className="text-gray-600 text-sm mt-1">
              Unlock your vault to manage saved credentials
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Master Key
            </label>
            <input
              type="password"
              value={masterKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMasterKey(e.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>
          <p className="text-xs text-gray-500 mb-6">
            This is the key you use to encrypt stored credentials.
          </p>
          <Button onClick={unlock} className="w-full">
            <Lock size={18} /> Unlock Vault
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden border-l border-gray-200 bg-white">
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Credential Vault</h2>
            <p className="text-gray-600 text-sm mt-1">
              Saved email account credentials
            </p>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem("maile-master-key");
              setUnlocked(false);
            }}
          >
            Lock Vault
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Loading credentials...
          </div>
        ) : credentials.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Mail size={32} className="mb-2 opacity-50" />
            <p>No saved credentials</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 text-sm text-gray-900">{c.email}</td>
                    <td className="py-4 text-sm text-gray-600 capitalize">{c.provider}</td>
                    <td className="py-4 text-sm">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

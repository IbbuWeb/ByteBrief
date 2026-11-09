import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Mail, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function Accounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    provider: "gmail",
    email: "",
    password: "",
    imapHost: "",
    imapPort: "",
    smtpHost: "",
    smtpPort: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const res = await api.get("/api/accounts/");
      setAccounts(res.data.accounts || []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  async function addAccount(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const masterKey = localStorage.getItem("maile-master-key");
      if (!masterKey) {
        setError("Master key not found. Please unlock your vault.");
        return;
      }
      await api.post(
        "/api/vault/credentials",
        {
          provider: form.provider,
          email: form.email,
          password: form.password,
          imapHost: form.imapHost || undefined,
          imapPort: form.imapPort ? parseInt(form.imapPort) : undefined,
          smtpHost: form.smtpHost || undefined,
          smtpPort: form.smtpPort ? parseInt(form.smtpPort) : undefined,
        },
        { headers: { "x-master-key": masterKey } }
      );
      toast.success("Account added");
      setForm({
        provider: "gmail",
        email: "",
        password: "",
        imapHost: "",
        imapPort: "",
        smtpHost: "",
        smtpPort: "",
      });
      loadAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add account");
      toast.error(error || "Failed to add account");
    } finally {
      setSubmitting(false);
    }
  }

  async function syncEmails() {
    const masterKey = localStorage.getItem("maile-master-key");
    if (!masterKey) {
      toast.error("Unlock your vault first");
      return;
    }
    setSyncing(true);
    try {
      const res = await api.post(
        "/api/accounts/sync",
        {},
        { headers: { "x-master-key": masterKey } }
      );
      toast.success(
        `Synced ${res.data.synced} new emails (${res.data.total} total)`
      );
      loadAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden border-l border-gray-200 bg-white">
      <div className="flex flex-col h-full max-w-3xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Connected Accounts</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage your connected email accounts
            </p>
          </div>
          <Button onClick={syncEmails} disabled={syncing} className="text-sm">
            <RefreshCw size={16} /> {syncing ? "Syncing..." : "Sync All"}
          </Button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <Mail size={32} className="mb-2 opacity-50" />
            <p>No accounts connected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
                    {acc.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {acc.email}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {acc.provider}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium rounded-full px-2 py-1 ${
                  acc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {acc.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex-1" />
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" />
            Add Account
          </h3>
          <form onSubmit={addAccount} className="space-y-4 max-w-md">
            <Input
              label="Provider"
              value={form.provider}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, provider: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password / App Password"
              type="password"
              value={form.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, password: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="IMAP Host"
                value={form.imapHost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, imapHost: e.target.value })}
              />
              <Input
                label="IMAP Port"
                type="number"
                value={form.imapPort}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, imapPort: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                value={form.smtpHost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, smtpHost: e.target.value })}
              />
              <Input
                label="SMTP Port"
                type="number"
                value={form.smtpPort}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, smtpPort: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Adding..." : "Add Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

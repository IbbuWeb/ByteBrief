import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Email } from "../types";

export function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("inbox");

  useEffect(() => {
    loadEmails();
  }, [folder]);

  async function loadEmails() {
    setLoading(true);
    try {
      const res = await api.get("/api/emails/", { params: { folder } });
      setEmails((res.data.emails || []) as Email[]);
    } catch {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }

  const folders = ["inbox", "starred", "spam", "trash"] as const;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="border-b border-gray-200 bg-white p-4 flex items-center gap-2 overflow-x-auto">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                folder === f
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              Loading emails...
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              No emails
            </div>
          ) : (
            <div className="space-y-1">
              {emails.map((email) => (
                <EmailRow key={email.id} email={email} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:flex lg:w-96 border-l border-gray-200 bg-white flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Email preview</h3>
          <p className="text-sm text-gray-500 mt-1">Select an email to read</p>
        </div>
        <div className="flex-1 p-6 text-center text-gray-400 text-sm">
          Select an email
        </div>
      </div>
    </div>
  );
}

function EmailRow({ email }: { email: Email }) {
  return (
    <button
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
    >
      <div className="w-2 h-2 rounded-full bg-gray-400" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">
            {email.fromName || email.fromEmail || "Unknown"}
          </span>
          <span className="text-xs text-gray-400">
            {email.receivedAt
              ? new Date(email.receivedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        <span className="text-sm text-gray-600 truncate mt-0.5">
          {email.subject || "(No subject)"}
        </span>
        <span className="text-xs text-gray-400 truncate mt-0.5">
          {email.snippet || ""}
        </span>
      </div>
    </button>
  );
}

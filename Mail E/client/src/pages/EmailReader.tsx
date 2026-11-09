import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Email } from "../types";
import { ChevronLeft, Star, Reply, ArrowRight, Trash, Archive } from "lucide-react";

export function EmailReader() {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api
        .get(`/api/emails/${id}`)
        .then((res) => setEmail(res.data.email as Email))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading email...
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400 text-sm">
        Email not found
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden border-l border-gray-200 bg-white">
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900" />
            <span className="text-sm font-medium text-gray-700">Message</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
            <Reply className="w-5 h-5 text-gray-500 hover:text-indigo-600" />
            <ArrowRight className="w-5 h-5 text-gray-500 hover:text-indigo-600" />
            <Trash className="w-5 h-5 text-gray-500 hover:text-red-500" />
            <Archive className="w-5 h-5 text-gray-500 hover:text-indigo-600" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {email.fromName || email.fromEmail || "Unknown"}
              </span>
              <span className="text-xs text-gray-500">{email.fromEmail}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {email.subject || "(No subject)"}
            </h1>
            <div className="text-xs text-gray-500 mb-6 border-b border-gray-100 pb-4">
              {email.receivedAt ? new Date(email.receivedAt).toLocaleString() : ""}
            </div>
            <div
              className="prose prose-sm text-gray-700 max-w-none"
              dangerouslySetInnerHTML={{
                __html: email.bodyHtml || email.bodyText || "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

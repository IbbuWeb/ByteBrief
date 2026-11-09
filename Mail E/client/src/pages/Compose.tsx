import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Send, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export function Compose() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/emails/send", {
        to,
        subject,
        body,
      });
      toast.success("Email sent");
      navigate("/app/inbox");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden border-l border-gray-200 bg-white">
      <div className="flex flex-col h-full max-w-3xl w-full">
        <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900" />
            <span className="text-lg font-semibold text-gray-900">New message</span>
          </div>
          <Button onClick={handleSend} disabled={loading}>
            <Send size={18} /> <span>Send</span>
          </Button>
        </div>
        <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-3">
              <Input
                label="To"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Subject"
                value={subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
              />
            </div>
          </div>
          <div>
            <textarea
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
              className="w-full min-h-[400px] rounded-md border border-gray-300 p-4 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none resize-y"
              placeholder="Write your message..."
            ></textarea>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Attach files
          </div>
        </form>
      </div>
    </div>
  );
}

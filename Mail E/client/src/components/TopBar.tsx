import { Search, Calendar } from "lucide-react";
import { useAuthStore } from "../store/auth";

export function TopBar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 px-4 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search all accounts"
          className="flex-1 px-2 py-1.5 text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400"
        />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-xs text-gray-600">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { Inbox, Star, Trash, Settings, Shield, LogOut, Send } from "lucide-react";

export function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200">
      <div className="h-full flex flex-col py-6 px-4">
        <div className="mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">MailE</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={<Inbox size={18} />} label="Unified Inbox" active />
          <SidebarItem icon={<Star size={18} />} label="Starred" />
          <SidebarItem icon={<Trash size={18} />} label="Trash" />
        </nav>

        <div className="space-y-1">
          <SidebarItem icon={<Send size={18} />} label="Compose" onClick={() => navigate("/app/compose")} />
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="px-3 space-y-1">
            <SidebarItem icon={<Shield size={18} />} label="Vault" />
            <SidebarItem icon={<Settings size={18} />} label="Settings" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

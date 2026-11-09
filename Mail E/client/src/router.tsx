import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Inbox } from "./pages/Inbox";
import { EmailReader } from "./pages/EmailReader";
import { Compose } from "./pages/Compose";
import { Accounts } from "./pages/Accounts";
import { Vault } from "./pages/Vault";
import { SettingsPage } from "./pages/Settings";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      { path: "inbox", element: <Inbox /> },
      { path: "email/:id", element: <EmailReader /> },
      { path: "compose", element: <Compose /> },
      { path: "accounts", element: <Accounts /> },
      { path: "vault", element: <Vault /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "", element: <Inbox /> },
    ],
  },
]);

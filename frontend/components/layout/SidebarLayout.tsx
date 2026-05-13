"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  MessageSquare,
  Library,
  Settings,
  LogOut,
  Bell,
  Search,
  Zap,
  Users,
  CheckCheck,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { notificationsApi } from "@/lib/api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RIMNNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "alert" | "assignment";
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  success: {
    icon: <CheckCircle2 size={16} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  alert: {
    icon: <AlertCircle size={16} />,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  assignment: {
    icon: <BookOpen size={16} />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  info: {
    icon: <Info size={16} />,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
};

// ── NotificationPanel ─────────────────────────────────────────────────────────
function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<RIMNNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.unreadCount();
      setUnreadCount(res.data.count ?? 0);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data ?? []);
      const unread = (res.data ?? []).filter((n: RIMNNotification) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {}
    setLoading(false);
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (notif: RIMNNotification) => {
    if (!notif.is_read) {
      await notificationsApi.markRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        aria-label="Notifications"
      >
        <Bell
          size={20}
          className={unreadCount > 0 ? "text-cyan-400" : "text-slate-400"}
        />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-cyan-500 text-[10px] font-bold text-black rounded-full flex items-center justify-center border-2 border-[#020408]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-12 w-[400px] bg-[#0b1120] border border-cyan-500/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-cyan-400" />
                <span className="font-bold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500">Loading…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-14 text-center">
                  <Bell size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">You're all caught up!</p>
                  <p className="text-xs text-slate-600 mt-1">No notifications yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {notifications.map((notif) => {
                    const style = TYPE_STYLES[notif.type] ?? TYPE_STYLES.info;
                    return (
                      <motion.li
                        key={notif.id}
                        layout
                        className={`px-5 py-4 cursor-pointer transition-all duration-200 ${
                          notif.is_read
                            ? "hover:bg-white/3 opacity-60"
                            : "hover:bg-cyan-500/5 bg-cyan-500/3"
                        }`}
                        onClick={() => handleMarkRead(notif)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Type Icon */}
                          <div
                            className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${style.bg} ${style.border} ${style.color}`}
                          >
                            {style.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-white leading-tight">
                                {notif.title}
                              </p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {!notif.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
                                )}
                                {notif.link && (
                                  <ExternalLink size={11} className="text-slate-600" />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1.5 font-medium">
                              {timeAgo(notif.created_at)}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/5 px-5 py-3 text-center">
                <span className="text-xs text-slate-600">
                  Showing last {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SidebarLayout ─────────────────────────────────────────────────────────────
export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const studentMenuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/student/dashboard" },
    { name: "New Submission", icon: <PlusCircle size={20} />, path: "/student/submit" },
    { name: "My Assessments", icon: <History size={20} />, path: "/student/history" },
    { name: "Concept Mastery", icon: <BarChart3 size={20} />, path: "/student/mastery" },
    { name: "AI Study Assistant", icon: <MessageSquare size={20} />, path: "/student/chat" },
    { name: "Analytics", icon: <BarChart3 size={20} />, path: "/student/analytics" },
    { name: "Resources", icon: <Library size={20} />, path: "/student/resources" },
    { name: "Settings", icon: <Settings size={20} />, path: "/student/settings" },
  ];

  const teacherMenuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, path: "/teacher/dashboard" },
    { name: "Submissions", icon: <History size={20} />, path: "/teacher/submissions" },
    { name: "Student Analytics", icon: <Users size={20} />, path: "/teacher/analytics" },
    { name: "Manage Classes", icon: <Library size={20} />, path: "/teacher/classes" },
    { name: "AI Insights", icon: <Zap size={20} />, path: "/teacher/insights" },
    { name: "Settings", icon: <Settings size={20} />, path: "/teacher/settings" },
  ];

  const menuItems = user?.role === "teacher" ? teacherMenuItems : studentMenuItems;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="flex min-h-screen bg-[#020408] text-slate-100">
      {/* Sidebar */}
      <aside className="w-72 border-r border-cyan-500/10 flex flex-col fixed h-full bg-[#020408] z-40">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-cyan-900/40">
            ⬡
          </div>
          <div>
            <h1 className="text-2xl font-black font-outfit tracking-tight">RIMN</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] -mt-1">Recursive Iterative</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="sidebar-item mt-8 text-red-400 hover:text-red-300 hover:bg-red-500/5"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-card p-4 rounded-2xl border-cyan-500/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                {user?.full_name?.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-72">
        {/* Header */}
        <header className="h-20 border-b border-cyan-500/10 flex items-center justify-between px-10 sticky top-0 bg-[#020408]/80 backdrop-blur-xl z-30">
          <h2 className="text-xl font-bold font-outfit text-white">
            {menuItems.find((i) => i.path === pathname)?.name || "Dashboard"}
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm w-80 outline-none focus:border-cyan-500/50 transition-all text-white"
              />
            </div>

            <NotificationPanel />
          </div>
        </header>

        <main className="p-10">{children}</main>
      </div>
    </div>
  );
}

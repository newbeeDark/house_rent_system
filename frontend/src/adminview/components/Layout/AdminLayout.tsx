import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../../../assets/admin-theme.css";
import { useAuth } from "../../../context/AuthContext";


// Components
import {
  AdminLayoutDashboardIcon,
  AdminBuildingIcon,
  AdminUsersIcon,
  AdminWrenchIcon,
  AdminCloseIcon,
  AdminBarChartIcon,
  AdminLogo,
  AdminLogoutIcon,

} from "../UI/AdminIcons";

// Menu Configuration
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: AdminLayoutDashboardIcon, path: "/admin/dashboard" },
  { id: "analytics", label: "Analytics", icon: AdminBarChartIcon, path: "/admin/analytics" },
  { id: "properties", label: "Properties", icon: AdminBuildingIcon, path: "/admin/properties" },
  { id: "users", label: "Users", icon: AdminUsersIcon, path: "/admin/users" },
  { id: "maintenance", label: "Maintenance", icon: AdminWrenchIcon, path: "/admin/maintenance" },
];

// --- Water Effect Component ---
const WaterSurface: React.FC<{ parentRef: React.RefObject<HTMLDivElement> }> = ({ parentRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: 0 });

  // Mouse events
  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const updateMouse = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const resetMouse = () => {
      mouseRef.current.x = -1000;
    };

    parent.addEventListener("mousemove", updateMouse);
    parent.addEventListener("mouseleave", resetMouse);

    return () => {
      parent.removeEventListener("mousemove", updateMouse);
      parent.removeEventListener("mouseleave", resetMouse);
    };
  }, [parentRef]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      if (!parentRef.current) {
        animationId && cancelAnimationFrame(animationId);
        return;
      }

      const width = parentRef.current.offsetWidth;
      const height = parentRef.current.offsetHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      timeRef.current += 0.05;
      const t = timeRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(59, 130, 246, 0.08)";

      ctx.beginPath();
      const baseHeight = 8;

      for (let x = 0; x <= width; x += 5) {
        const wave = Math.sin(x * 0.03 + t) * 3;
        const mouseDist = Math.abs(x - mouseRef.current.x);
        const spread = 60;
        const maxDepression = 25;
        const depression = maxDepression * Math.exp(-0.5 * Math.pow(mouseDist / spread, 2));
        const y = baseHeight + wave + depression;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      animationId && cancelAnimationFrame(animationId);
    };
  }, [parentRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
      style={{ zIndex: 0 }}
    />
  );
};

// --- Sidebar Component ---
const Sidebar: React.FC<{ isOpen: boolean; closeSidebar: () => void }> = ({
  isOpen,
  closeSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <div
        className={`admin-sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <AdminBuildingIcon width={20} height={20} />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight text-slate-800">
                RentAdmin
              </h2>
              <p className="text-xs text-slate-500 font-medium">Pro Dashboard</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <AdminCloseIcon width={20} height={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            // 更安全的匹配方式：支持子路由
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon
                  width={20}
                  height={20}
                  className={isActive ? "text-blue-600" : "text-slate-400"}
                />
                <span>{item.label}</span>
                {item.id === "maintenance" && (
                  <span className="ml-auto bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    2
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-800 mb-1">Need Help?</h4>
            <p className="text-xs text-slate-500 mb-3">
              Check our docs for more info.
            </p>
            <button className="w-full py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              Documentation
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- TopBar Component ---
const TopBar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  // 改为「点击展开」而不是 hover 展开
  const [menuExpanded, setMenuExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // 更安全的 activeItem 匹配方式
  const activeItem =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.path)) ||
    NAV_ITEMS[0];

  const otherItems = NAV_ITEMS.filter((item) => item.id !== activeItem.id).slice(
    0,
    6
  );

  const handleToggleMenu = () => {
    setMenuExpanded((prev) => !prev);
  };

  const handleNavigateItem = (path: string) => {
    navigate(path);
    setMenuExpanded(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="top-nav">
      <div className="flex items-center gap-8">
        <AdminLogo />

        <div
          ref={containerRef}
          className="relative h-12 flex items-center group rounded-lg px-2 -ml-2 transition-all ease-out overflow-hidden cursor-pointer"
          style={{
            transitionDuration: "1500ms",
            maxWidth: menuExpanded ? "800px" : "180px",
          }}
          onClick={handleToggleMenu}
        >
          {menuExpanded && <WaterSurface parentRef={containerRef} />}

          <div className="relative z-10 flex items-center pl-1">
            <div
              className={`whitespace-nowrap transition-all duration-300 ease-in-out mr-1 ${menuExpanded
                ? "text-sm font-medium text-blue-600"
                : "text-xl font-bold text-slate-800"
                }`}
            >
              <span className="inline-block origin-center">
                <span className="capitalize">{activeItem?.label}</span>
              </span>
            </div>

            <div
              className={`flex items-center gap-1 transition-opacity duration-300 ${menuExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              // 防止点击子按钮时再触发父容器的 toggle
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-px h-4 bg-slate-300 mx-2 flex-shrink-0" />

              {otherItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigateItem(item.path)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-colors relative nav-item whitespace-nowrap"
                >
                  <span className="inline-block origin-center">
                    {item.label}
                  </span>
                </button>
              ))}

              <div className="w-px h-4 bg-slate-300 mx-2 flex-shrink-0" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                  setMenuExpanded(false);
                }}
                className="text-slate-400 hover:text-blue-600 px-2 nav-item"
              >
                <span className="inline-block origin-center text-xs font-bold">
                  More
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-4">
        <button
          onClick={() => logout()}
          className="p-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all relative"
          title="Logout"
        >
          <AdminLogoutIcon width={20} height={20} />
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1" />

        <button
          onClick={toggleSidebar}
          className="group flex items-center gap-3 p-1.5 pl-3 rounded-full hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all duration-300"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
              {user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Manager'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-tr from-blue-600 to-purple-600 text-sm">
                {user?.name ? getInitials(user.name) : 'AD'}
              </span>
            </div>
          </div>
        </button>
      </nav>
    </header>
  );
};

// --- Main Layout Component ---
export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout-root">
      <TopBar toggleSidebar={toggleSidebar} />

      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

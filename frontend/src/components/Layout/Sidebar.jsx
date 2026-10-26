import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, Megaphone, Star, Bell, FileText, Settings,
  ChevronDown, ChevronRight, Store, Mail, MessageSquare, X,
} from "lucide-react";

// 🛠️ FIX: All paths must start with a leading "/" to work with React Router
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  {
    icon: Package,
    label: "Products",
    path: "/admin/products",
    children: [
      { label: "Product List", path: "/admin/products" },
      { label: "Create Product", path: "/admin/products/create" },
      { label: "Categories", path: "/admin/products/categories" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    path: "/admin/orders",
    children: [
      { label: "Order List", path: "/admin/orders" },
      { label: "Refunds", path: "/admin/orders/refunds" },
    ],
  },
  { icon: Users, label: "Customers", path: "/admin/customers" },
  { icon: Users, label: "Users", path: "/admin/users" },
  {
    icon: BarChart2,
    label: "Analytics",
    path: "/admin/analytics",
    children: [
      { label: "Overview", path: "/admin/analytics" },
      { label: "Sales", path: "/admin/analytics/sales" },
      { label: "Products", path: "/admin/analytics/products" },
      { label: "Customers", path: "/admin/analytics/customers" },
    ],
  },
  { icon: Tag, label: "Discounts", path: "/admin/discounts" },
  {
    icon: Megaphone,
    label: "Promotions",
    path: "/admin/promotions",
    children: [
      { label: "Campaigns", path: "/admin/promotions" },
      { label: "Banners", path: "/admin/promotions/banners" },
    ],
  },
  { icon: Star, label: "Reviews", path: "/admin/reviews" },
  { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
  { icon: MessageSquare, label: "Contact Messages", path: "/admin/contacts" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: FileText, label: "Logs", path: "/admin/logs" },
  {
    icon: Settings,
    label: "Settings",
    path: "/admin/settings",
    children: [
      { label: "General", path: "/admin/settings" },
      { label: "Personalization", path: "/admin/settings/personalization" },
      { label: "Homepage Layout", path: "/admin/settings/homepage" },
      { label: "Banners", path: "/admin/settings/banners" },
      { label: "Themes", path: "/admin/settings/themes" },
    ],
  },
];

function NavItem({ item, collapsed, onNavClick }) {
  const location = useLocation();
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => location.pathname.startsWith(c.path))
  );
  
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");

  const content = (
    <>
      <item.icon size={19} className="nav-icon" />
      {!collapsed && (
        <>
          <span className="nav-label">{item.label}</span>
          {item.children && (
            <span className="nav-chevron">
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </>
      )}
    </>
  );

  if (item.children) {
    return (
      <div className="nav-group">
        <button
          className={`nav-item ${isActive ? "nav-item-active" : ""}`}
          onClick={() => !collapsed && setOpen((o) => !o)}
          title={collapsed ? item.label : ""}
        >
          {content}
        </button>
        {open && !collapsed && (
          <div className="nav-children">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) => `nav-child ${isActive ? "nav-child-active" : ""}`}
                onClick={onNavClick}
                end
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
      title={collapsed ? item.label : ""}
      onClick={onNavClick}
      end
    >
      {content}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle, onNavClick }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Store size={20} />
          </div>
          {/* 🛠️ FIX: Rebranded from Ecombay to Nairobi Fashion */}
          {!collapsed && <span className="logo-text">Nairobi Fashion</span>}
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="toggle-icon-desktop">
            <ChevronRight size={16} className={collapsed ? "" : "rotate-180"} />
          </span>
          <span className="toggle-icon-mobile">
            <X size={16} />
          </span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} onNavClick={onNavClick} />
        ))}
      </nav>

      <style>{`
        :root {
          --sidebar-dark: #4E3B2C; /* 🛠️ Nairobi Dark Brown */
          --sidebar-item-bg: rgba(255, 255, 255, 0.06);
          --accent-orange: #A6754D; /* 🛠️ Nairobi Orange */
          --text-muted: #DCC7AA; /* 🛠️ Cream */
          --text-bright: #FFFFFF;
        }

        .sidebar {
          width: 240px;
          min-width: 240px;
          background: var(--sidebar-dark);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          flex-shrink: 0;
          height: 100vh;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .sidebar-collapsed {
          width: 72px;
          min-width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          padding: 20px 16px;
          justify-content: space-between;
          position: relative;
          flex-shrink: 0;
        }

        .sidebar-collapsed .sidebar-header {
          justify-content: center;
          padding: 20px 0;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: var(--accent-orange);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(166, 117, 77, 0.3);
        }

        .logo-text {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-bright);
          white-space: nowrap;
          letter-spacing: -0.02em;
        }

        .sidebar-toggle-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-muted);
          cursor: pointer;
          padding: 5px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .sidebar-toggle-btn:hover {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .rotate-180 { transform: rotate(180deg); }
        .toggle-icon-mobile { display: none; }
        .toggle-icon-desktop { display: flex; }

        @media (max-width: 767px) {
          .toggle-icon-mobile { display: flex; }
          .toggle-icon-desktop { display: none; }
        }

        .sidebar-nav {
          flex: 1;
          padding: 8px 12px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-collapsed .sidebar-nav { padding: 8px 8px; }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s ease;
          margin-bottom: 4px;
          border: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
          font-size: 13.5px;
        }

        .sidebar-collapsed .nav-item {
          justify-content: center;
          padding: 12px 0;
        }

        .nav-icon { flex-shrink: 0; transition: transform 0.2s; }

        .nav-item:hover {
          background: var(--sidebar-item-bg);
          color: var(--text-bright);
        }

        .nav-item-active {
          background: rgba(166, 117, 77, 0.2) !important;
          color: var(--text-bright) !important;
          font-weight: 600;
        }

        .nav-item-active .nav-icon { transform: scale(1.1); color: var(--accent-orange); }

        .nav-label {
          margin-left: 12px;
          flex: 1;
          white-space: nowrap;
          font-size: 13.5px;
          font-weight: 500;
          text-align: left;
        }

        .nav-chevron { margin-left: auto; opacity: 0.4; }

        .nav-children {
          margin-left: 22px;
          padding-left: 16px;
          border-left: 1px solid rgba(255,255,255,0.1);
          margin-top: 4px;
          margin-bottom: 8px;
        }

        .nav-child {
          display: block;
          padding: 8px 0;
          color: #b5a090;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }

        .nav-child:hover { color: var(--text-bright); }
        .nav-child-active { color: var(--accent-orange) !important; font-weight: 700; }

        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/Layout/Sidebar";
import Topbar from "../../components/Layout/Topbar";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          flex-direction: row;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #F4EDE4; /* 🛠️ Nairobi Cream background */
        }

        /* ── Desktop sidebar ── */
        .sidebar-desktop {
          flex-shrink: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
        }

        /* ── Mobile drawer overlay ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 200;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .sidebar-overlay.open {
          opacity: 1;
        }

        .sidebar-drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 201;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .sidebar-drawer.open {
          transform: translateX(0);
        }

        /* ── Main content ── */
        .admin-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .admin-topbar-wrapper {
          flex-shrink: 0;
        }

        .admin-page-content {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        /* 🛠️ Changed from max-width 1280px to 1600px to fill large screens better */
        .admin-page-inner {
          width: 100%;
          padding: 24px 16px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* ── Mobile hamburger in topbar ── */
        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: transparent;
          border: 1px solid #DCC7AA;
          border-radius: 8px;
          cursor: pointer;
          color: #4E3B2C;
          flex-shrink: 0;
          margin-right: 8px;
        }
        .mobile-menu-btn:hover {
          background: #FAF6F0;
        }

        /* ── Breakpoint: tablet and below (< 768px) ── */
        @media (max-width: 767px) {
          .sidebar-desktop {
            display: none;
          }
          .sidebar-overlay {
            display: block;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .admin-page-inner {
            padding: 16px 12px;
          }
        }

        /* ── Breakpoint: small tablet (768px – 1023px): show collapsed sidebar ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar-overlay {
            display: none;
          }
          .mobile-menu-btn {
            display: none;
          }
        }
      `}</style>

      <div className="admin-layout">
        
        {/* Desktop Sidebar */}
        <div className="sidebar-desktop">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Mobile Overlay */}
        <div
          className={`sidebar-overlay ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Mobile Drawer */}
        <div className={`sidebar-drawer ${mobileOpen ? "open" : ""}`}>
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onNavClick={() => setMobileOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="admin-main">
          <div className="admin-topbar-wrapper">
            <Topbar onMobileMenuClick={() => setMobileOpen(true)} />
          </div>
          <div className="admin-page-content">
            <div className="admin-page-inner">
              <Outlet />
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
}

export default AdminLayout;
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AppLayout({ children, user }) {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const navItems = [
        { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { href: '/compose', icon: '✏️', label: 'Create' },
        { href: '/calendar', icon: '📆', label: 'Calendar' },
        { href: '/connections', icon: '🔗', label: 'Connections' },
    ]

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }

        .app-root { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; display: flex; }

        /* ── DESKTOP SIDEBAR ── */
        .sidebar {
          position: fixed; top: 0; left: 0;
          width: 240px; height: 100vh;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          padding: 28px 20px; z-index: 100;
        }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; padding: 0 8px; }
        .brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .brand-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
        .nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; color: rgba(255,255,255,0.45); font-size: 14px; font-weight: 500; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .nav-item.active { background: rgba(108,99,255,0.15); color: #6c63ff; }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-bottom { margin-top: auto; }
        .user-card { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 12px; margin-bottom: 10px; }
        .user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-email { font-size: 12px; color: rgba(255,255,255,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .logout-btn { width: 100%; padding: 10px; background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: rgba(255,255,255,0.35); font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .logout-btn:hover { border-color: rgba(239,68,68,0.4); color: #fca5a5; background: rgba(239,68,68,0.06); }

        /* ── MAIN CONTENT ── */
        .main-content { margin-left: 240px; padding: 40px 48px; width: calc(100% - 240px); min-height: 100vh; }

        /* ── MOBILE TOPBAR ── */
        .mobile-topbar {
          display: none;
          position: fixed; top: 0; left: 0; right: 0;
          height: 60px; background: #0a0a0f;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 20px;
          align-items: center; justify-content: space-between;
          z-index: 200;
        }
        .mobile-brand { display: flex; align-items: center; gap: 8px; }
        .mobile-brand-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .mobile-brand-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
        .menu-btn { background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px; }

        /* ── MOBILE DRAWER ── */
        .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300; backdrop-filter: blur(4px); }
        .drawer-overlay.open { display: block; }
        .drawer { position: fixed; top: 0; right: 0; width: 260px; height: 100vh; background: #111118; border-left: 1px solid rgba(255,255,255,0.08); z-index: 400; padding: 28px 20px; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease; }
        .drawer.open { transform: translateX(0); }
        .drawer-close { align-self: flex-end; background: none; border: none; color: rgba(255,255,255,0.4); font-size: 20px; cursor: pointer; margin-bottom: 24px; }
        .drawer-user { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 12px; margin-bottom: 24px; }
        .drawer-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .drawer-bottom { margin-top: auto; }

        /* ── MOBILE BOTTOM NAV ── */
        .bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 64px;
          background: rgba(10,10,15,0.95);
          border-top: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(12px);
          z-index: 200;
          padding: 0 8px;
          align-items: center; justify-content: space-around;
        }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 16px; border-radius: 10px; text-decoration: none; color: rgba(255,255,255,0.35); transition: color 0.15s; min-width: 60px; }
        .bottom-nav-item.active { color: #6c63ff; }
        .bottom-nav-icon { font-size: 20px; }
        .bottom-nav-label { font-size: 10px; font-weight: 500; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0; padding: 80px 16px 80px; }
          .mobile-topbar { display: flex; }
          .bottom-nav { display: flex; }
        }

        @media (min-width: 769px) {
          .drawer-overlay, .drawer, .bottom-nav, .mobile-topbar { display: none !important; }
        }
      `}</style>

            <div className="app-root">

                {/* Desktop Sidebar */}
                <aside className="sidebar">
                    <div className="brand">
                        <div className="brand-icon">📅</div>
                        <span className="brand-name">PostPilot</span>
                    </div>
                    <nav className="nav">
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
                                <span className="nav-icon">{item.icon}</span> {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="sidebar-bottom">
                        <div className="user-card">
                            <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
                    </div>
                </aside>

                {/* Mobile Topbar */}
                <div className="mobile-topbar">
                    <div className="mobile-brand">
                        <div className="mobile-brand-icon">📅</div>
                        <span className="mobile-brand-name">PostPilot</span>
                    </div>
                    <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
                </div>

                {/* Mobile Drawer */}
                <div className={`drawer-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
                <div className={`drawer ${menuOpen ? 'open' : ''}`}>
                    <button className="drawer-close" onClick={() => setMenuOpen(false)}>✕</button>
                    <div className="drawer-user">
                        <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                        <div className="user-email">{user?.email}</div>
                    </div>
                    <nav className="drawer-nav">
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                                <span className="nav-icon">{item.icon}</span> {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="drawer-bottom">
                        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="main-content">
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="bottom-nav">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}>
                            <span className="bottom-nav-icon">{item.icon}</span>
                            <span className="bottom-nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

            </div>
        </>
    )
}
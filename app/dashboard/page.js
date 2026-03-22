'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [stats, setStats] = useState({ scheduled: 0, published: 0, draft: 0, failed: 0 })
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')



    const fetchPosts = async (userId) => {
        const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)
        if (data) {
            setPosts(data)
            setStats({
                scheduled: data.filter(p => p.status === 'scheduled').length,
                published: data.filter(p => p.status === 'published').length,
                draft: data.filter(p => p.status === 'draft').length,
                failed: data.filter(p => p.status === 'failed').length,
            })
        }
    }

    const fetchAccounts = async (userId) => {
        const { data } = await supabase
            .from('connected_accounts')
            .select('*')
            .eq('user_id', userId)
        if (data) setAccounts(data)
    }

    useEffect(() => {
        let cancelled = false
        const init = async () => {
            const { data } = await supabase.auth.getUser()
            const user = data?.user
            if (!user) { window.location.href = '/login'; return }
            if (cancelled) return
            setUser(user)
            await Promise.all([fetchPosts(user.id), fetchAccounts(user.id)])
            if (cancelled) return
            setLoading(false)

            // Check URL for success/error messages
            const params = new URLSearchParams(window.location.search)
            if (params.get('success') === 'instagram_connected') setSuccessMsg('✅ Instagram connected successfully!')
            if (params.get('error')) setErrorMsg(`❌ Error: ${params.get('error')}`)
            // Clean URL
            window.history.replaceState({}, '', '/dashboard')
        }
        const t = setTimeout(init, 0)
        return () => { cancelled = true; clearTimeout(t) }
    }, [])

    const handleDisconnect = async (platform) => {
        const account = accounts.find(a => a.platform === platform)
        if (!account) return
        await supabase.from('connected_accounts').delete().eq('id', account.id)
        setAccounts(prev => prev.filter(a => a.platform !== platform))
        setSuccessMsg(`✅ ${platform} disconnected.`)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const statusColor = (status) => {
        const map = { scheduled: '#6c63ff', published: '#22c55e', draft: '#f97316', failed: '#ef4444', publishing: '#06b6d4' }
        return map[status] || '#888'
    }

    const platformIcon = (platforms) => {
        if (!platforms) return ''
        return platforms.map(p => p === 'linkedin' ? '💼' : '📸').join(' ')
    }

    const getAccount = (platform) => accounts.find(a => a.platform === platform)

    const isTokenExpiringSoon = (account) => {
        if (!account?.token_expires_at) return false
        const daysLeft = (new Date(account.token_expires_at) - new Date()) / (1000 * 60 * 60 * 24)
        return daysLeft < 7
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>Loading...</div>
        </div>
    )

    const igAccount = getAccount('instagram')
    const liAccount = getAccount('linkedin')

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .dash-root { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; }
        .sidebar { position: fixed; top: 0; left: 0; width: 240px; height: 100vh; background: rgba(255,255,255,0.03); border-right: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; padding: 28px 20px; z-index: 100; }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; padding: 0 8px; }
        .brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .brand-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
        .nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; color: rgba(255,255,255,0.45); font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .nav-item.active { background: rgba(108,99,255,0.15); color: #6c63ff; }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-bottom { margin-top: auto; }
        .user-card { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(255,255,255,0.04); border-radius: 12px; margin-bottom: 10px; }
        .user-avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-email { font-size: 12px; color: rgba(255,255,255,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .logout-btn { width: 100%; padding: 10px; background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: rgba(255,255,255,0.35); font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .logout-btn:hover { border-color: rgba(239,68,68,0.4); color: #fca5a5; background: rgba(239,68,68,0.06); }
        .main { margin-left: 240px; padding: 40px 48px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); }
        .new-post-btn { display: flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, #6c63ff, #4f46e5); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; text-decoration: none; transition: opacity 0.2s, transform 0.15s; }
        .new-post-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .alert { padding: 12px 16px; border-radius: 12px; font-size: 13px; margin-bottom: 24px; }
        .alert.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #86efac; }
        .alert.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }
        .alert.warning { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #fdba74; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; transition: border-color 0.2s; }
        .stat-card:hover { border-color: rgba(255,255,255,0.12); }
        .stat-label { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
        .stat-bar { height: 3px; border-radius: 999px; background: rgba(255,255,255,0.07); margin-top: 14px; overflow: hidden; }
        .stat-bar-fill { height: 100%; border-radius: 999px; transition: width 1s ease; }
        .section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
        .section-title span { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif; }
        .posts-table { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 1fr 120px 120px 140px; padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.6px; }
        .table-row { display: grid; grid-template-columns: 1fr 120px 120px 140px; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; transition: background 0.15s; }
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: rgba(255,255,255,0.03); }
        .post-content { font-size: 14px; color: rgba(255,255,255,0.75); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 20px; }
        .post-type { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 3px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .empty-state { padding: 64px 24px; text-align: center; color: rgba(255,255,255,0.25); }
        .empty-state .emoji { font-size: 40px; margin-bottom: 16px; }
        .empty-state p { font-size: 14px; margin-bottom: 20px; }
        .empty-link { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); border-radius: 10px; color: #6c63ff; font-size: 13px; font-weight: 600; text-decoration: none; transition: background 0.15s; }
        .empty-link:hover { background: rgba(108,99,255,0.25); }

        /* Connected accounts */
        .connect-section { margin-top: 32px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; }
        .connect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
        .connect-card { padding: 16px 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; transition: border-color 0.2s; }
        .connect-card.connected { border-color: rgba(34,197,94,0.25); background: rgba(34,197,94,0.04); }
        .connect-card.expiring { border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.04); }
        .connect-top { display: flex; align-items: center; justify-content: space-between; }
        .connect-info { display: flex; align-items: center; gap: 12px; }
        .connect-logo { font-size: 22px; }
        .connect-name { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
        .connect-status { font-size: 12px; color: rgba(255,255,255,0.3); }
        .connect-status.connected { color: #86efac; }
        .connect-status.expiring { color: #fdba74; }
        .connect-actions { display: flex; gap: 8px; align-items: center; }
        .connect-btn { padding: 7px 14px; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); border-radius: 8px; color: #6c63ff; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; transition: background 0.15s; }
        .connect-btn:hover { background: rgba(108,99,255,0.25); }
        .disconnect-btn { padding: 7px 14px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #fca5a5; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
        .disconnect-btn:hover { background: rgba(239,68,68,0.15); }
        .reconnect-btn { padding: 7px 14px; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.3); border-radius: 8px; color: #fdba74; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; transition: background 0.15s; }
        .connect-username { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 6px; }
        .connect-username .dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
        .connect-username .dot.expiring { background: #f97316; }
        .expires-text { font-size: 11px; color: rgba(255,255,255,0.25); margin-left: auto; }
      `}</style>

            <div className="dash-root">
                <aside className="sidebar">
                    <div className="brand">
                        <div className="brand-icon">📅</div>
                        <span className="brand-name">PostPilot</span>
                    </div>
                    <nav className="nav">
                        <Link href="/dashboard" className="nav-item active"><span className="nav-icon">🏠</span> Dashboard</Link>
                        <Link href="/compose" className="nav-item"><span className="nav-icon">✏️</span> Create Post</Link>
                        <Link href="/calendar" className="nav-item"><span className="nav-icon">📆</span> Calendar</Link>
                        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🔗</span> Connections</Link>
                    </nav>
                    <div className="sidebar-bottom">
                        <div className="user-card">
                            <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
                    </div>
                </aside>

                <main className="main">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Dashboard</h1>
                            <p className="page-sub">Here&apos;s what&apos;s going on with your posts</p>
                        </div>
                        <Link href="/compose" className="new-post-btn">+ New Post</Link>
                    </div>

                    {/* Alerts */}
                    {successMsg && <div className="alert success">{successMsg}</div>}
                    {errorMsg && <div className="alert error">{errorMsg}</div>}
                    {igAccount && isTokenExpiringSoon(igAccount) && (
                        <div className="alert warning">⚠️ Your Instagram token expires soon. Please reconnect your account to avoid publishing failures.</div>
                    )}

                    {/* Stats */}
                    <div className="stats-grid">
                        {[
                            { label: 'Scheduled', value: stats.scheduled, color: '#6c63ff', pct: '60%' },
                            { label: 'Published', value: stats.published, color: '#22c55e', pct: '80%' },
                            { label: 'Drafts', value: stats.draft, color: '#f97316', pct: '30%' },
                            { label: 'Failed', value: stats.failed, color: '#ef4444', pct: '10%' },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                                <div className="stat-bar">
                                    <div className="stat-bar-fill" style={{ width: s.value > 0 ? s.pct : '0%', background: s.color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Posts */}
                    <div className="section-title">Recent Posts <span>{posts.length} total</span></div>
                    <div className="posts-table">
                        {posts.length === 0 ? (
                            <div className="empty-state">
                                <div className="emoji">✍️</div>
                                <p>No posts yet. Create your first post!</p>
                                <Link href="/compose" className="empty-link">+ Create Post</Link>
                            </div>
                        ) : (
                            <>
                                <div className="table-header">
                                    <div>Content</div>
                                    <div>Platforms</div>
                                    <div>Status</div>
                                    <div>Scheduled</div>
                                </div>
                                {posts.map(post => (
                                    <div className="table-row" key={post.id}>
                                        <div>
                                            <div className="post-content">{post.content}</div>
                                            <div className="post-type">{post.post_type}</div>
                                        </div>
                                        <div style={{ fontSize: 18 }}>{platformIcon(post.platforms)}</div>
                                        <div>
                                            <span className="status-badge" style={{ background: `${statusColor(post.status)}18`, color: statusColor(post.status), border: `1px solid ${statusColor(post.status)}33` }}>
                                                <div className="status-dot" style={{ background: statusColor(post.status) }} />
                                                {post.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{formatDate(post.scheduled_at)}</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Connected Accounts */}
                    <div className="connect-section">
                        <div className="section-title">Connected Accounts</div>
                        <div className="connect-grid">

                            {/* Instagram */}
                            <div className={`connect-card ${igAccount ? (isTokenExpiringSoon(igAccount) ? 'expiring' : 'connected') : ''}`}>
                                <div className="connect-top">
                                    <div className="connect-info">
                                        <div className="connect-logo">📸</div>
                                        <div>
                                            <div className="connect-name">Instagram</div>
                                            <div className={`connect-status ${igAccount ? (isTokenExpiringSoon(igAccount) ? 'expiring' : 'connected') : ''}`}>
                                                {igAccount ? (isTokenExpiringSoon(igAccount) ? '⚠️ Token expiring soon' : '● Connected') : 'Not connected'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="connect-actions">
                                        {igAccount ? (
                                            <>
                                                <a href={`/api/auth/instagram?user_id=${user?.id}`} className="reconnect-btn">Reconnect</a>
                                                <button className="disconnect-btn" onClick={() => handleDisconnect('instagram')}>Disconnect</button>
                                            </>
                                        ) : (
                                            <a href={`/api/auth/instagram?user_id=${user?.id}`} className="connect-btn">Connect</a>
                                        )}
                                    </div>
                                </div>
                                {igAccount && (
                                    <div className="connect-username">
                                        <div className={`dot ${isTokenExpiringSoon(igAccount) ? 'expiring' : ''}`} />
                                        @{igAccount.username}
                                        {igAccount.token_expires_at && (
                                            <span className="expires-text">
                                                Expires {new Date(igAccount.token_expires_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* LinkedIn */}
                            <div className={`connect-card ${liAccount ? 'connected' : ''}`}>
                                <div className="connect-top">
                                    <div className="connect-info">
                                        <div className="connect-logo">💼</div>
                                        <div>
                                            <div className="connect-name">LinkedIn</div>
                                            <div className={`connect-status ${liAccount ? 'connected' : ''}`}>
                                                {liAccount ? '● Connected' : 'Not connected'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="connect-actions">
                                        {liAccount ? (
                                            <>
                                                <a href={`/api/auth/linkedin?user_id=${user?.id}`} className="reconnect-btn">Reconnect</a>
                                                <button className="disconnect-btn" onClick={() => handleDisconnect('linkedin')}>Disconnect</button>
                                            </>
                                        ) : (
                                            <a href={`/api/auth/linkedin?user_id=${user?.id}`} className="connect-btn">Connect</a>
                                        )}
                                    </div>
                                </div>
                                {liAccount && (
                                    <div className="connect-username">
                                        <div className="dot" />
                                        {liAccount.username || 'LinkedIn Account'}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
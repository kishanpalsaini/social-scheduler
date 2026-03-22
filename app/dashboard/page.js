'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [stats, setStats] = useState({ scheduled: 0, published: 0, draft: 0, failed: 0 })
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')



    const fetchPosts = async (userId) => {
        const { data } = await supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
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
        const { data } = await supabase.from('connected_accounts').select('*').eq('user_id', userId)
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
            const params = new URLSearchParams(window.location.search)
            if (params.get('success') === 'instagram_connected') setSuccessMsg('✅ Instagram connected successfully!')
            if (params.get('error')) setErrorMsg(`❌ ${params.get('error')}`)
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
    }

    const statusColor = (s) => ({ scheduled: '#6c63ff', published: '#22c55e', draft: '#f97316', failed: '#ef4444', publishing: '#06b6d4' }[s] || '#888')
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
    const platformIcon = (p) => p ? p.map(x => x === 'linkedin' ? '💼' : '📸').join(' ') : ''
    const getAccount = (platform) => accounts.find(a => a.platform === platform)
    const isExpiringSoon = (acc) => acc?.token_expires_at && (new Date(acc.token_expires_at) - new Date()) / 86400000 < 7

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>Loading...</div>
        </div>
    )

    const igAccount = getAccount('instagram')
    const liAccount = getAccount('linkedin')

    return (
        <AppLayout user={user}>
            <style>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); }
        .new-post-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #6c63ff, #4f46e5); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; text-decoration: none; white-space: nowrap; transition: opacity 0.2s; }
        .new-post-btn:hover { opacity: 0.85; }
        .alert { padding: 12px 16px; border-radius: 12px; font-size: 13px; margin-bottom: 20px; }
        .alert.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #86efac; }
        .alert.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }
        .alert.warning { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #fdba74; }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; }
        .stat-label { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; line-height: 1; }
        .stat-bar { height: 3px; border-radius: 999px; background: rgba(255,255,255,0.07); margin-top: 12px; overflow: hidden; }
        .stat-bar-fill { height: 100%; border-radius: 999px; }

        /* Posts */
        .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
        .section-count { font-size: 12px; color: rgba(255,255,255,0.3); }
        .posts-table { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; margin-bottom: 24px; }
        .table-header { display: grid; grid-template-columns: 1fr 80px 100px 120px; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.6px; }
        .table-row { display: grid; grid-template-columns: 1fr 80px 100px 120px; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; }
        .table-row:last-child { border-bottom: none; }
        .post-content { font-size: 13px; color: rgba(255,255,255,0.75); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 12px; }
        .post-type { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
        .empty-state { padding: 48px 24px; text-align: center; color: rgba(255,255,255,0.25); }
        .empty-emoji { font-size: 36px; margin-bottom: 12px; }
        .empty-text { font-size: 14px; margin-bottom: 16px; }
        .empty-link { display: inline-flex; padding: 9px 18px; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); border-radius: 9px; color: #6c63ff; font-size: 13px; font-weight: 600; text-decoration: none; }

        /* Accounts */
        .accounts-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; }
        .accounts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .account-card { padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; transition: border-color 0.2s; }
        .account-card.connected { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.03); }
        .account-card.expiring { border-color: rgba(249,115,22,0.25); background: rgba(249,115,22,0.03); }
        .account-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .account-info { display: flex; align-items: center; gap: 10px; }
        .account-logo { font-size: 20px; }
        .account-name { font-size: 14px; font-weight: 500; }
        .account-status { font-size: 11px; color: rgba(255,255,255,0.3); }
        .account-status.connected { color: #86efac; }
        .account-status.expiring { color: #fdba74; }
        .account-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .btn-connect { padding: 6px 12px; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); border-radius: 7px; color: #6c63ff; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; }
        .btn-reconnect { padding: 6px 12px; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); border-radius: 7px; color: #fdba74; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; }
        .btn-disconnect { padding: 6px 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18); border-radius: 7px; color: #fca5a5; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .account-username { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 6px; }
        .green-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
        .orange-dot { width: 5px; height: 5px; border-radius: 50%; background: #f97316; flex-shrink: 0; }
        .expires-text { margin-left: auto; font-size: 10px; color: rgba(255,255,255,0.2); }

        /* MOBILE */
        @media (max-width: 768px) {
          .page-title { font-size: 22px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px; }
          .stat-value { font-size: 26px; }
          .table-header { display: none; }
          .table-row { grid-template-columns: 1fr auto; gap: 8px; }
          .table-row > div:nth-child(2) { display: none; }
          .table-row > div:nth-child(4) { display: none; }
          .accounts-grid { grid-template-columns: 1fr; }
          .account-top { flex-wrap: wrap; }
          .new-post-btn span { display: none; }
          .new-post-btn::after { content: '+'; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .page-header { flex-direction: row; align-items: center; }
        }
      `}</style>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">Here&apos;s what&apos;s going on with your posts</p>
                </div>
                <Link href="/compose" className="new-post-btn">
                    <span>+ New Post</span>
                </Link>
            </div>

            {successMsg && <div className="alert success">{successMsg}</div>}
            {errorMsg && <div className="alert error">{errorMsg}</div>}
            {igAccount && isExpiringSoon(igAccount) && (
                <div className="alert warning">⚠️ Instagram token expires soon — please reconnect your account.</div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Scheduled', value: stats.scheduled, color: '#6c63ff' },
                    { label: 'Published', value: stats.published, color: '#22c55e' },
                    { label: 'Drafts', value: stats.draft, color: '#f97316' },
                    { label: 'Failed', value: stats.failed, color: '#ef4444' },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-bar">
                            <div className="stat-bar-fill" style={{ width: s.value > 0 ? '60%' : '0%', background: s.color }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Posts */}
            <div className="section-header">
                <div className="section-title">Recent Posts</div>
                <div className="section-count">{posts.length} total</div>
            </div>
            <div className="posts-table">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-emoji">✍️</div>
                        <div className="empty-text">No posts yet. Create your first post!</div>
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
                                <div style={{ fontSize: 16 }}>{platformIcon(post.platforms)}</div>
                                <div>
                                    <span className="status-badge" style={{ background: `${statusColor(post.status)}18`, color: statusColor(post.status), border: `1px solid ${statusColor(post.status)}33` }}>
                                        ● {post.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(post.scheduled_at)}</div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Connected Accounts */}
            <div className="accounts-section">
                <div className="section-header">
                    <div className="section-title">Connected Accounts</div>
                </div>
                <div className="accounts-grid">
                    {/* Instagram */}
                    <div className={`account-card ${igAccount ? (isExpiringSoon(igAccount) ? 'expiring' : 'connected') : ''}`}>
                        <div className="account-top">
                            <div className="account-info">
                                <span className="account-logo">📸</span>
                                <div>
                                    <div className="account-name">Instagram</div>
                                    <div className={`account-status ${igAccount ? (isExpiringSoon(igAccount) ? 'expiring' : 'connected') : ''}`}>
                                        {igAccount ? (isExpiringSoon(igAccount) ? '⚠️ Expiring soon' : '● Connected') : 'Not connected'}
                                    </div>
                                </div>
                            </div>
                            <div className="account-actions">
                                {igAccount ? (
                                    <>
                                        <a href={`/api/auth/instagram?user_id=${user?.id}`} className="btn-reconnect">Refresh</a>
                                        <button className="btn-disconnect" onClick={() => handleDisconnect('instagram')}>Remove</button>
                                    </>
                                ) : (
                                    <a href={`/api/auth/instagram?user_id=${user?.id}`} className="btn-connect">Connect</a>
                                )}
                            </div>
                        </div>
                        {igAccount && (
                            <div className="account-username">
                                <div className={isExpiringSoon(igAccount) ? 'orange-dot' : 'green-dot'} />
                                @{igAccount.username}
                                {igAccount.token_expires_at && (
                                    <span className="expires-text">Exp {new Date(igAccount.token_expires_at).toLocaleDateString()}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div className={`account-card ${liAccount ? 'connected' : ''}`}>
                        <div className="account-top">
                            <div className="account-info">
                                <span className="account-logo">💼</span>
                                <div>
                                    <div className="account-name">LinkedIn</div>
                                    <div className={`account-status ${liAccount ? 'connected' : ''}`}>
                                        {liAccount ? '● Connected' : 'Not connected'}
                                    </div>
                                </div>
                            </div>
                            <div className="account-actions">
                                {liAccount ? (
                                    <>
                                        <a href={`/api/auth/linkedin?user_id=${user?.id}`} className="btn-reconnect">Refresh</a>
                                        <button className="btn-disconnect" onClick={() => handleDisconnect('linkedin')}>Remove</button>
                                    </>
                                ) : (
                                    <a href={`/api/auth/linkedin?user_id=${user?.id}`} className="btn-connect">Connect</a>
                                )}
                            </div>
                        </div>
                        {liAccount && (
                            <div className="account-username">
                                <div className="green-dot" />
                                {liAccount.username || 'LinkedIn Account'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
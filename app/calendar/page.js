'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Calendar() {
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState(null)
    // const [mounted, setMounted] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)


    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }
        setUser(user)
        await fetchPosts(user.id)
    }

    const fetchPosts = async (userId) => {
        const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .not('scheduled_at', 'is', null)
            .order('scheduled_at', { ascending: true })
        if (data) setPosts(data)
    }


    useEffect(() => {
        // schedule async init off the current tick to avoid synchronous setState inside effect
        let cancelled = false
        const init = async () => {
            const { data } = await supabase.auth.getUser()
            const user = data?.user
            if (!user) { window.location.href = '/login'; return }
            if (cancelled) return
            setUser(user)
            await fetchPosts(user.id)
        }
        const t = setTimeout(init, 0)
        return () => { cancelled = true; clearTimeout(t) }
    }, [])



    const handleDelete = async (postId) => {
        setDeletingId(postId)
        const { error } = await supabase.from('posts').delete().eq('id', postId)
        if (!error) {
            setPosts(prev => prev.filter(p => p.id !== postId))
            setConfirmDelete(null)
        }
        setDeletingId(null)
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev = new Date(year, month, 0).getDate()

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const getPostsForDay = (day) => posts.filter(p => {
        const d = new Date(p.scheduled_at)
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

    const isToday = (day) => {
        const t = new Date()
        return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day
    }

    const statusColor = (status) => {
        const map = { scheduled: '#6c63ff', published: '#22c55e', draft: '#f97316', failed: '#ef4444' }
        return map[status] || '#888'
    }

    const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : []

    const cells = []
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false })
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true })
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false })

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .root { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; }
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
        .main { margin-left: 240px; padding: 40px 48px; opacity: 0; transform: translateY(16px); transition: opacity 0.5s, transform 0.5s; }
        .main.visible { opacity: 1; transform: translateY(0); }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); }
        .new-post-btn { display: flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, #6c63ff, #4f46e5); border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; text-decoration: none; transition: opacity 0.2s, transform 0.15s; }
        .new-post-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .cal-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        .cal-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; }
        .cal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .cal-month { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
        .cal-nav { display: flex; gap: 8px; }
        .cal-nav-btn { width: 34px; height: 34px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .cal-nav-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); padding: 0 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .cal-weekday { padding: 12px 8px; text-align: center; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); padding: 8px; gap: 4px; }
        .cal-cell { min-height: 88px; border-radius: 10px; padding: 8px; cursor: pointer; transition: background 0.15s; position: relative; }
        .cal-cell:hover { background: rgba(255,255,255,0.04); }
        .cal-cell.selected { background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.3); }
        .cal-cell.other-month { opacity: 0.25; pointer-events: none; }
        .cal-day { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 6px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .cal-day.today { background: linear-gradient(135deg, #6c63ff, #4f46e5); color: #fff; font-weight: 700; }
        .post-dot { display: flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 5px; margin-bottom: 3px; font-size: 10px; font-weight: 600; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 100%; }
        .more-dots { font-size: 10px; color: rgba(255,255,255,0.3); padding-left: 4px; }
        .side-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; position: sticky; top: 24px; }
        .side-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .side-sub { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 20px; }

        /* Post item with actions */
        .post-item { padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; margin-bottom: 10px; transition: border-color 0.15s; }
        .post-item:hover { border-color: rgba(255,255,255,0.12); }
        .post-item-time { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 6px; }
        .post-item-content { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.5; margin-bottom: 10px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .post-item-footer { display: flex; align-items: center; justify-content: space-between; }
        .post-item-actions { display: flex; gap: 6px; }
        .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
        .platform-icons { font-size: 14px; }
        .action-btn { padding: 5px 10px; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; transition: all 0.15s; }
        .edit-btn { background: rgba(108,99,255,0.15); color: #6c63ff; }
        .edit-btn:hover { background: rgba(108,99,255,0.25); }
        .delete-btn { background: rgba(239,68,68,0.1); color: #fca5a5; }
        .delete-btn:hover { background: rgba(239,68,68,0.2); }

        /* Confirm dialog */
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .confirm-box { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; width: 340px; text-align: center; }
        .confirm-icon { font-size: 36px; margin-bottom: 12px; }
        .confirm-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .confirm-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 24px; line-height: 1.6; }
        .confirm-actions { display: flex; gap: 10px; }
        .confirm-cancel { flex: 1; padding: 11px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: rgba(255,255,255,0.6); font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .confirm-delete { flex: 1; padding: 11px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); border-radius: 10px; color: #fca5a5; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
        .confirm-delete:hover { background: rgba(239,68,68,0.3); }

        .empty-day { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.25); }
        .empty-day .icon { font-size: 32px; margin-bottom: 10px; }
        .empty-day p { font-size: 13px; margin-bottom: 16px; }
        .empty-link { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); border-radius: 9px; color: #6c63ff; font-size: 12px; font-weight: 600; text-decoration: none; }
        .legend { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.35); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .upcoming-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; margin-top: 24px; }
        .upcoming-row { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .upcoming-row:last-child { border-bottom: none; }
        .upcoming-date { min-width: 42px; text-align: center; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 6px 4px; }
        .upcoming-day { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; line-height: 1; }
        .upcoming-mon { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
        .upcoming-content { flex: 1; }
        .upcoming-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; margin-bottom: 4px; }
        .upcoming-meta { font-size: 11px; color: rgba(255,255,255,0.25); }
      `}</style>

            {/* Confirm Delete Dialog */}
            {confirmDelete && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <div className="confirm-icon">🗑️</div>
                        <div className="confirm-title">Delete this post?</div>
                        <div className="confirm-sub">
                            &quot;{confirmDelete.content?.slice(0, 60)}...&quot;<br />
                            This action cannot be undone.
                        </div>
                        <div className="confirm-actions">
                            <button className="confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button
                                className="confirm-delete"
                                onClick={() => handleDelete(confirmDelete.id)}
                                disabled={deletingId === confirmDelete.id}
                            >
                                {deletingId === confirmDelete.id ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="root">
                <aside className="sidebar">
                    <div className="brand">
                        <div className="brand-icon">📅</div>
                        <span className="brand-name">PostPilot</span>
                    </div>
                    <nav className="nav">
                        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span> Dashboard</Link>
                        <Link href="/compose" className="nav-item"><span className="nav-icon">✏️</span> Create Post</Link>
                        <Link href="/calendar" className="nav-item active"><span className="nav-icon">📆</span> Calendar</Link>
                        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🔗</span> Connections</Link>
                    </nav>
                    <div className="sidebar-bottom">
                        <div className="user-card">
                            <div className="user-avatar">{user?.email?.[0]?.toUpperCase()}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                        <button className="logout-btn" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}>Sign out</button>
                    </div>
                </aside>

                <main className={`main visible`}>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Calendar</h1>
                            <p className="page-sub">View and manage your scheduled posts</p>
                        </div>
                        <Link href="/compose" className="new-post-btn">+ New Post</Link>
                    </div>

                    <div className="cal-layout">
                        <div>
                            <div className="cal-card">
                                <div className="cal-header">
                                    <div className="cal-month">{monthName} {year}</div>
                                    <div className="cal-nav">
                                        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                                        <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
                                        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
                                    </div>
                                </div>
                                <div className="cal-weekdays">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                        <div key={d} className="cal-weekday">{d}</div>
                                    ))}
                                </div>
                                <div className="cal-grid">
                                    {cells.map((cell, i) => {
                                        const dayPosts = cell.current ? getPostsForDay(cell.day) : []
                                        return (
                                            <div
                                                key={i}
                                                className={`cal-cell ${!cell.current ? 'other-month' : ''} ${selectedDay === cell.day && cell.current ? 'selected' : ''}`}
                                                onClick={() => cell.current && setSelectedDay(selectedDay === cell.day ? null : cell.day)}
                                            >
                                                <div className={`cal-day ${isToday(cell.day) && cell.current ? 'today' : ''}`}>{cell.day}</div>
                                                {dayPosts.slice(0, 2).map(p => (
                                                    <div key={p.id} className="post-dot" style={{ background: `${statusColor(p.status)}22`, color: statusColor(p.status) }}>
                                                        {p.platforms?.includes('linkedin') ? '💼' : '📸'} {p.content?.slice(0, 12)}…
                                                    </div>
                                                ))}
                                                {dayPosts.length > 2 && <div className="more-dots">+{dayPosts.length - 2} more</div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="legend">
                                {[['#6c63ff', 'Scheduled'], ['#22c55e', 'Published'], ['#f97316', 'Draft'], ['#ef4444', 'Failed']].map(([c, l]) => (
                                    <div key={l} className="legend-item">
                                        <div className="legend-dot" style={{ background: c }} />{l}
                                    </div>
                                ))}
                            </div>

                            {posts.filter(p => new Date(p.scheduled_at) >= new Date()).length > 0 && (
                                <div className="upcoming-card">
                                    <div className="side-title">Upcoming Posts</div>
                                    <div className="side-sub">Next scheduled posts</div>
                                    {posts.filter(p => new Date(p.scheduled_at) >= new Date()).slice(0, 5).map(p => {
                                        const d = new Date(p.scheduled_at)
                                        return (
                                            <div key={p.id} className="upcoming-row">
                                                <div className="upcoming-date">
                                                    <div className="upcoming-day">{d.getDate()}</div>
                                                    <div className="upcoming-mon">{d.toLocaleString('default', { month: 'short' })}</div>
                                                </div>
                                                <div className="upcoming-content">
                                                    <div className="upcoming-text">{p.content}</div>
                                                    <div className="upcoming-meta">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {p.platforms?.join(', ')}</div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                                                    <span className="status-badge" style={{ background: `${statusColor(p.status)}18`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}33` }}>
                                                        {p.status}
                                                    </span>
                                                    <button className="action-btn delete-btn" onClick={() => setConfirmDelete(p)}>🗑 Delete</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Side panel */}
                        <div className="side-card">
                            {selectedDay ? (
                                <>
                                    <div className="side-title">{monthName} {selectedDay}</div>
                                    <div className="side-sub">{selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} scheduled</div>
                                    {selectedPosts.length === 0 ? (
                                        <div className="empty-day">
                                            <div className="icon">📭</div>
                                            <p>No posts for this day</p>
                                            <Link href="/compose" className="empty-link">+ Schedule Post</Link>
                                        </div>
                                    ) : selectedPosts.map(p => (
                                        <div key={p.id} className="post-item">
                                            <div className="post-item-time">🕐 {new Date(p.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div className="post-item-content">{p.content}</div>
                                            <div className="post-item-footer">
                                                <span className="status-badge" style={{ background: `${statusColor(p.status)}18`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}33` }}>
                                                    ● {p.status}
                                                </span>
                                                <div className="post-item-actions">
                                                    <span className="platform-icons">{p.platforms?.map(pl => pl === 'linkedin' ? '💼' : '📸').join(' ')}</span>
                                                    <button className="action-btn edit-btn" onClick={() => window.location.href = `/compose?edit=${p.id}`}>✏️ Edit</button>
                                                    <button className="action-btn delete-btn" onClick={() => setConfirmDelete(p)}>🗑️ Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="empty-day">
                                    <div className="icon">👆</div>
                                    <p>Click any day to see posts scheduled for that day</p>
                                    <Link href="/compose" className="empty-link">+ New Post</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Compose() {
    const [user, setUser] = useState(null)
    const [content, setContent] = useState('')
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState(null)
    const [scheduledAt, setScheduledAt] = useState('')
    const [platforms, setPlatforms] = useState({ linkedin: true, instagram: false })
    const [postType, setPostType] = useState('feed')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [mounted, setMounted] = useState(false)
    const fileRef = useRef()

    useEffect(() => {
        setMounted(true)
        getUser()
    }, [])

    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }
        setUser(user)
    }

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
        setFilePreview(URL.createObjectURL(f))
    }

    const togglePlatform = (p) => {
        setPlatforms(prev => ({ ...prev, [p]: !prev[p] }))
    }

    const handleSubmit = async (status) => {
        if (!content.trim()) { setMessage({ text: 'Please write some content!', type: 'error' }); return }
        const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p])
        if (selectedPlatforms.length === 0) { setMessage({ text: 'Select at least one platform.', type: 'error' }); return }

        setLoading(true)
        setMessage({ text: '', type: '' })

        try {
            let mediaUrls = []
            if (file) {
                const ext = file.name.split('.').pop()
                const path = `${user.id}/${Date.now()}.${ext}`
                const { data, error } = await supabase.storage.from('post-media').upload(path, file)
                if (error) throw error
                mediaUrls = [data.path]
            }
            const { error } = await supabase.from('posts').insert({
                user_id: user.id,
                content,
                media_urls: mediaUrls,
                platforms: selectedPlatforms,
                post_type: postType,
                scheduled_at: status === 'scheduled' && scheduledAt ? scheduledAt : null,
                status,
            })
            if (error) throw error
            setMessage({ text: status === 'scheduled' ? '🎉 Post scheduled successfully!' : '✅ Draft saved!', type: 'success' })
            setContent('')
            setFile(null)
            setFilePreview(null)
            setScheduledAt('')
        } catch (err) {
            setMessage({ text: err.message, type: 'error' })
        }
        setLoading(false)
    }

    const charLimit = 3000
    const charCount = content.length
    const charPct = Math.min((charCount / charLimit) * 100, 100)
    const charColor = charCount > charLimit * 0.9 ? '#ef4444' : charCount > charLimit * 0.7 ? '#f97316' : '#6c63ff'

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }

        .root { min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; display: flex; }

        /* Sidebar */
        .sidebar {
          position: fixed; top: 0; left: 0;
          width: 240px; height: 100vh;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column; padding: 28px 20px; z-index: 100;
        }
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

        /* Mobile topbar */
        .mobile-topbar { display: none; position: fixed; top: 0; left: 0; right: 0; height: 60px; background: #0a0a0f; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 20px; align-items: center; justify-content: space-between; z-index: 200; }
        .mobile-brand { display: flex; align-items: center; gap: 8px; }
        .mobile-brand-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .mobile-brand-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }

        /* Bottom nav */
        .bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: rgba(10,10,15,0.97); border-top: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); z-index: 200; padding: 0 8px; align-items: center; justify-content: space-around; }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 16px; border-radius: 10px; text-decoration: none; color: rgba(255,255,255,0.35); }
        .bottom-nav-item.active { color: #6c63ff; }
        .bottom-nav-icon { font-size: 20px; }
        .bottom-nav-label { font-size: 10px; font-weight: 500; }

        /* Main */
        .main { margin-left: 240px; padding: 40px 48px; width: 100%; opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .main.visible { opacity: 1; transform: translateY(0); }

        .page-header { margin-bottom: 36px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: rgba(255,255,255,0.35); }

        .compose-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; }
        .card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 20px; color: rgba(255,255,255,0.8); }

        .textarea { width: 100%; min-height: 220px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; color: #fff; font-size: 15px; line-height: 1.7; font-family: 'DM Sans', sans-serif; resize: vertical; outline: none; transition: border-color 0.2s; }
        .textarea::placeholder { color: rgba(255,255,255,0.2); }
        .textarea:focus { border-color: rgba(108,99,255,0.5); background: rgba(108,99,255,0.04); }

        .char-row { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; margin-bottom: 20px; }
        .char-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.07); border-radius: 999px; margin-right: 12px; overflow: hidden; }
        .char-fill { height: 100%; border-radius: 999px; transition: width 0.2s, background 0.2s; }
        .char-count { font-size: 12px; color: rgba(255,255,255,0.3); }

        .upload-zone { border: 2px dashed rgba(255,255,255,0.1); border-radius: 14px; padding: 28px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; margin-bottom: 20px; }
        .upload-zone:hover { border-color: rgba(108,99,255,0.4); background: rgba(108,99,255,0.04); }
        .upload-zone.has-file { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.04); padding: 0; overflow: hidden; }
        .upload-icon { font-size: 28px; margin-bottom: 8px; }
        .upload-text { font-size: 13px; color: rgba(255,255,255,0.35); }
        .upload-sub { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 4px; }
        .preview-img { width: 100%; max-height: 200px; object-fit: cover; display: block; border-radius: 12px; }
        .remove-file { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; background: rgba(239,68,68,0.1); color: #fca5a5; font-size: 12px; cursor: pointer; border: none; width: 100%; font-family: 'DM Sans', sans-serif; border-radius: 0 0 12px 12px; }
        .remove-file:hover { background: rgba(239,68,68,0.2); }

        .type-row { display: flex; gap: 8px; margin-bottom: 0; }
        .type-btn { flex: 1; padding: 9px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; text-align: center; }
        .type-btn.active { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); color: #6c63ff; }
        .type-btn:hover:not(.active) { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); }

        .platform-card { margin-bottom: 16px; }
        .platform-toggle { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; cursor: pointer; transition: all 0.15s; margin-bottom: 8px; }
        .platform-toggle.on { background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.3); }
        .platform-info { display: flex; align-items: center; gap: 10px; }
        .platform-logo { font-size: 20px; }
        .platform-name { font-size: 14px; font-weight: 500; }
        .toggle-pill { width: 36px; height: 20px; border-radius: 999px; background: rgba(255,255,255,0.1); position: relative; transition: background 0.2s; }
        .toggle-pill.on { background: #6c63ff; }
        .toggle-knob { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
        .toggle-pill.on .toggle-knob { transform: translateX(16px); }

        .schedule-card { margin-bottom: 16px; }
        .field-label { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
        .datetime-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 11px; padding: 12px 14px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; colorscheme: dark; }
        .datetime-input:focus { border-color: rgba(108,99,255,0.5); }

        .msg { padding: 12px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .msg.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }
        .msg.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #86efac; }

        .action-row { display: flex; flex-direction: column; gap: 10px; }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
        .btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-primary { background: linear-gradient(135deg, #6c63ff, #4f46e5); color: #fff; }
        .btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-topbar { display: flex; }
          .bottom-nav { display: flex; }
          .main { margin-left: 0; padding: 76px 16px 80px; }
          .page-title { font-size: 22px; }
          .compose-grid { grid-template-columns: 1fr; }
          .card { padding: 18px; border-radius: 14px; }
          .textarea { min-height: 160px; font-size: 14px; }
          .upload-zone { padding: 20px; }
        }
      `}</style>

            <div className="root">
                {/* Desktop Sidebar */}
                <aside className="sidebar">
                    <div className="brand">
                        <div className="brand-icon">📅</div>
                        <span className="brand-name">PostPilot</span>
                    </div>
                    <nav className="nav">
                        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span> Dashboard</Link>
                        <Link href="/compose" className="nav-item active"><span className="nav-icon">✏️</span> Create Post</Link>
                        <Link href="/calendar" className="nav-item"><span className="nav-icon">📆</span> Calendar</Link>
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

                {/* Mobile Topbar */}
                <div className="mobile-topbar">
                    <div className="mobile-brand">
                        <div className="mobile-brand-icon">📅</div>
                        <span className="mobile-brand-name">PostPilot</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Create Post</div>
                </div>

                {/* Main */}
                <main className={`main ${mounted ? 'visible' : ''}`}>
                    <div className="page-header">
                        <h1 className="page-title">Create Post</h1>
                        <p className="page-sub">Write once, publish to multiple platforms</p>
                    </div>

                    <div className="compose-grid">
                        {/* Left: Editor */}
                        <div>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-title">✍️ Your Content</div>
                                <textarea
                                    className="textarea"
                                    placeholder="What do you want to share today? Write your post here..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    maxLength={charLimit}
                                />
                                <div className="char-row">
                                    <div className="char-bar">
                                        <div className="char-fill" style={{ width: `${charPct}%`, background: charColor }} />
                                    </div>
                                    <span className="char-count" style={{ color: charColor }}>{charCount} / {charLimit}</span>
                                </div>
                                <div className={`upload-zone ${file ? 'has-file' : ''}`} onClick={() => !file && fileRef.current.click()}>
                                    {filePreview ? (
                                        <>
                                            <img src={filePreview} className="preview-img" alt="preview" />
                                            <button className="remove-file" onClick={e => { e.stopPropagation(); setFile(null); setFilePreview(null) }}>✕ Remove media</button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="upload-icon">🖼️</div>
                                            <div className="upload-text">Click to upload image or video</div>
                                            <div className="upload-sub">JPG, PNG, MP4 up to 50MB</div>
                                        </>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>

                            <div className="card">
                                <div className="card-title">📱 Post Format</div>
                                <div className="type-row">
                                    {['feed', 'reel', 'story'].map(t => (
                                        <button key={t} className={`type-btn ${postType === t ? 'active' : ''}`} onClick={() => setPostType(t)}>
                                            {t === 'feed' ? '📄 Feed' : t === 'reel' ? '🎬 Reel' : '⭕ Story'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Settings */}
                        <div>
                            <div className="card platform-card">
                                <div className="card-title">🌐 Publish To</div>
                                {[
                                    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
                                    { key: 'instagram', label: 'Instagram', icon: '📸' },
                                ].map(p => (
                                    <div key={p.key} className={`platform-toggle ${platforms[p.key] ? 'on' : ''}`} onClick={() => togglePlatform(p.key)}>
                                        <div className="platform-info">
                                            <span className="platform-logo">{p.icon}</span>
                                            <span className="platform-name">{p.label}</span>
                                        </div>
                                        <div className={`toggle-pill ${platforms[p.key] ? 'on' : ''}`}>
                                            <div className="toggle-knob" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="card schedule-card">
                                <div className="card-title">⏰ Schedule</div>
                                <div className="field-label">Publish Date & Time</div>
                                <input
                                    type="datetime-local"
                                    className="datetime-input"
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
                                    Leave empty to save as draft
                                </div>
                            </div>

                            {message.text && <div className={`msg ${message.type}`}>{message.text}</div>}

                            <div className="action-row">
                                <button className="btn btn-primary" onClick={() => handleSubmit('scheduled')} disabled={loading || !scheduledAt}>
                                    {loading ? 'Saving...' : '🚀 Schedule Post'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={loading}>
                                    💾 Save as Draft
                                </button>
                            </div>

                            <div className="divider" />
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
                                Posts are published automatically at the scheduled time. Make sure your accounts are connected.
                            </div>
                        </div>
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="bottom-nav">
                    <Link href="/dashboard" className="bottom-nav-item">
                        <span className="bottom-nav-icon">🏠</span>
                        <span className="bottom-nav-label">Home</span>
                    </Link>
                    <Link href="/compose" className="bottom-nav-item active">
                        <span className="bottom-nav-icon">✏️</span>
                        <span className="bottom-nav-label">Create</span>
                    </Link>
                    <Link href="/calendar" className="bottom-nav-item">
                        <span className="bottom-nav-icon">📆</span>
                        <span className="bottom-nav-label">Calendar</span>
                    </Link>
                    <Link href="/dashboard" className="bottom-nav-item">
                        <span className="bottom-nav-icon">🔗</span>
                        <span className="bottom-nav-label">Connect</span>
                    </Link>
                </nav>
            </div>
        </>
    )
}
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [mounted] = useState(true) // Directly set mounted to true

    const handleLogin = async () => {
        setLoading(true)
        setMessage('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMessage(error.message)
        else window.location.href = '/dashboard'
        setLoading(false)
    }

    const handleSignup = async () => {
        setLoading(true)
        setMessage('')
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setMessage(error.message)
        else setMessage('Check your email to confirm your account!')
        setLoading(false)
    }

    const handleSubmit = () => isLogin ? handleLogin() : handleSignup()

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0a0a0f; }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Animated background blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #6c63ff, #3b2fd4);
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #f97316, #ec4899);
          bottom: -80px; right: -60px;
          animation-delay: -4s;
        }
        .blob-3 {
          width: 260px; height: 260px;
          background: radial-gradient(circle, #06b6d4, #6c63ff);
          top: 50%; left: 55%;
          animation-delay: -8s;
        }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }

        /* Grid texture overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Left panel */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          position: relative;
          z-index: 1;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 72px;
        }
        .brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #6c63ff, #f97316);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .hero-text {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 800;
          line-height: 1.08;
          color: #fff;
          letter-spacing: -1.5px;
          margin-bottom: 24px;
        }
        .hero-text .accent {
          background: linear-gradient(90deg, #6c63ff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 56px;
        }

        .platform-chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .chip {
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 500;
          backdrop-filter: blur(8px);
          display: flex; align-items: center; gap: 6px;
        }
        .chip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6c63ff;
        }
        .chip-dot.orange { background: #f97316; }

        /* Divider */
        .divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent);
          margin: 40px 0;
          align-self: stretch;
          position: relative;
          z-index: 1;
        }

        /* Right panel — card */
        .right-panel {
          width: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          z-index: 1;
        }

        .card {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 48px 40px;
          backdrop-filter: blur(20px);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .card-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 36px;
        }

        .field {
          margin-bottom: 16px;
        }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus {
          border-color: rgba(108, 99, 255, 0.6);
          background: rgba(108, 99, 255, 0.07);
        }

        .error-msg {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .success-msg {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #86efac;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6c63ff, #4f46e5);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-primary .shimmer {
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          to { left: 160%; }
        }

        .toggle-row {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
        }
        .toggle-btn {
          background: none;
          border: none;
          color: #6c63ff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          font-family: 'DM Sans', sans-serif;
        }
        .toggle-btn:hover { text-decoration: underline; }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .divider { display: none; }
          .right-panel { width: 100%; }
        }
      `}</style>

            <div className="login-root">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <div className="grid-overlay" />

                {/* Left panel */}
                <div className="left-panel">
                    <div className="brand">
                        <div className="brand-icon">📅</div>
                        <span className="brand-name">PostPilot</span>
                    </div>
                    <h1 className="hero-text">
                        Schedule once,<br />
                        <span className="accent">publish everywhere.</span>
                    </h1>
                    <p className="hero-sub">
                        Create your content once and publish to LinkedIn and Instagram simultaneously — on your schedule.
                    </p>
                    <div className="platform-chips">
                        <div className="chip"><div className="chip-dot" />LinkedIn</div>
                        <div className="chip"><div className="chip-dot orange" />Instagram</div>
                        <div className="chip"><div className="chip-dot" />Reels & Stories</div>
                        <div className="chip"><div className="chip-dot orange" />Auto-schedule</div>
                    </div>
                </div>

                <div className="divider" />

                {/* Right panel */}
                <div className="right-panel">
                    <div className={`card ${mounted ? 'visible' : ''}`}>
                        <h2 className="card-title">{isLogin ? 'Welcome back' : 'Create account'}</h2>
                        <p className="card-sub">{isLogin ? 'Sign in to your workspace' : 'Start scheduling for free'}</p>

                        <div className="field">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                        </div>
                        <div className="field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                        </div>

                        {message && (
                            <div className={message.includes('Check') ? 'success-msg' : 'error-msg'}>
                                {message}
                            </div>
                        )}

                        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                            <div className="shimmer" />
                            {loading ? 'Please wait...' : isLogin ? 'Sign in →' : 'Create account →'}
                        </button>

                        <div className="toggle-row">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button className="toggle-btn" onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
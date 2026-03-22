export default function DataDeletion() {
    return (
        <>
            <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0a0a0f; }
          .page { min-height: 100vh; background: #0a0a0f; color: #fff; font-family: 'DM Sans', sans-serif; padding: 60px 24px; }
          .container { max-width: 760px; margin: 0 auto; }
          .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; }
          .brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
          .brand-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
          .badge { display: inline-block; padding: 4px 12px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); border-radius: 999px; color: #fca5a5; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          h1 { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
          .subtitle { font-size: 16px; color: rgba(255,255,255,0.4); margin-bottom: 48px; line-height: 1.6; }
          .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 40px 0; }
          h2 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 16px; }
          p { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
  
          /* Steps */
          .steps { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }
          .step { display: flex; gap: 16px; align-items: flex-start; padding: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; }
          .step-num { width: 32px; height: 32px; background: linear-gradient(135deg, #6c63ff, #4f46e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
          .step-content h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; color: #fff; }
          .step-content p { font-size: 13px; color: rgba(255,255,255,0.45); margin: 0; line-height: 1.6; }
  
          /* Warning box */
          .warning { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
          .warning p { color: #fca5a5; margin: 0; font-size: 14px; }
  
          /* What gets deleted */
          .data-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
          .data-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; font-size: 13px; color: rgba(255,255,255,0.6); }
          .data-icon { font-size: 16px; }
  
          /* Contact */
          .contact-card { background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2); border-radius: 16px; padding: 28px; margin-top: 40px; }
          .contact-card h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
          .contact-card p { margin-bottom: 16px; font-size: 14px; }
          .email-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #6c63ff, #4f46e5); border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
          .email-btn:hover { opacity: 0.85; text-decoration: none; }
          a { color: #6c63ff; }
        `}</style>

            <div className="page">
                <div className="container">
                    <div className="brand">
                        <div className="brand-icon">📅</div>
                        <span className="brand-name">PostPilot</span>
                    </div>

                    <div className="badge">Data Deletion</div>
                    <h1>Delete Your Data</h1>
                    <p className="subtitle">
                        You have full control over your data. You can delete your posts, disconnect your social accounts, or request complete account deletion at any time.
                    </p>

                    <div className="divider" />

                    <h2>Option 1 — Self-Service (Instant)</h2>
                    <p>You can remove most of your data directly from the app without contacting us:</p>

                    <div className="steps">
                        <div className="step">
                            <div className="step-num">1</div>
                            <div className="step-content">
                                <h3>Log in to your PostPilot account</h3>
                                <p>Go to <a href="https://social-scheduler-404-kp.vercel.app/login">social-scheduler-404-kp.vercel.app/login</a> and sign in</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">2</div>
                            <div className="step-content">
                                <h3>Disconnect your social accounts</h3>
                                <p>Go to Dashboard → Connected Accounts → click Disconnect next to Instagram and LinkedIn</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">3</div>
                            <div className="step-content">
                                <h3>Delete your scheduled posts</h3>
                                <p>Go to Calendar → click on any post → click the Delete button</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-num">4</div>
                            <div className="step-content">
                                <h3>Request full account deletion</h3>
                                <p>Email us at the address below and we will delete your account and all remaining data within 48 hours</p>
                            </div>
                        </div>
                    </div>

                    <div className="divider" />

                    <h2>What Gets Deleted</h2>
                    <p>When you request full account deletion, we permanently remove:</p>
                    <div className="data-list">
                        {[
                            ['📧', 'Your email and account credentials'],
                            ['🔑', 'Instagram and LinkedIn access tokens'],
                            ['📝', 'All scheduled and published posts'],
                            ['🖼️', 'All uploaded images and media'],
                            ['📊', 'Publish history and logs'],
                            ['📅', 'Calendar data and settings'],
                        ].map(([icon, text]) => (
                            <div key={text} className="data-item">
                                <span className="data-icon">{icon}</span>
                                {text}
                            </div>
                        ))}
                    </div>

                    <div className="warning">
                        <p>⚠️ Data deletion is permanent and cannot be undone. Make sure to save any content you want to keep before requesting deletion.</p>
                    </div>

                    <div className="divider" />

                    <h2>Option 2 — Contact Us</h2>
                    <p>If you can&apos;t access your account or need help with data deletion, contact us directly and we&apos;ll handle it within 48 hours.</p>

                    <div className="contact-card">
                        <h3>📬 Request Data Deletion</h3>
                        <p>Send us an email with the subject line <strong style={{ color: '#fff' }}>Data Deletion Request</strong> and include the email address associated with your PostPilot account.</p>
                        <a href="mailto:sarcastic.socials@gmail.com?subject=Data Deletion Request" className="email-btn">
                            ✉️ Send Deletion Request
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
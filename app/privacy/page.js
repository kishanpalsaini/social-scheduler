export default function Privacy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .page { min-height: 100vh; background: #0a0a0f; color: #fff; font-family: 'DM Sans', sans-serif; padding: 60px 24px; }
        .container { max-width: 760px; margin: 0 auto; }
        .back { display: inline-flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.4); font-size: 14px; text-decoration: none; margin-bottom: 48px; transition: color 0.15s; }
        .back:hover { color: #fff; }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; }
        .brand-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #6c63ff, #f97316); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .brand-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; }
        .badge { display: inline-block; padding: 4px 12px; background: rgba(108,99,255,0.15); border: 1px solid rgba(108,99,255,0.3); border-radius: 999px; color: #6c63ff; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        h1 { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
        .updated { font-size: 14px; color: rgba(255,255,255,0.3); margin-bottom: 48px; }
        .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 40px 0; }
        .section { margin-bottom: 36px; }
        h2 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #fff; }
        p { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
        ul { padding-left: 20px; }
        ul li { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        .highlight { background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.15); border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
        .highlight p { color: rgba(255,255,255,0.7); margin: 0; }
        .contact-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-top: 40px; }
        .contact-card h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .contact-card p { margin: 0; }
        a { color: #6c63ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>
      <div className="page">
        <div className="container">
          <div className="brand">
            <div className="brand-icon">📅</div>
            <span className="brand-name">PostPilot</span>
          </div>

          <div className="badge">Legal</div>
          <h1>Privacy Policy</h1>
          <p className="updated">Last updated: March 22, 2026</p>

          <div className="highlight">
            <p>We built PostPilot to help you schedule and publish content to social media. This policy explains what data we collect, how we use it, and your rights over it. We keep things simple and never sell your data.</p>
          </div>

          <div className="divider" />

          <div className="section">
            <h2>1. Information We Collect</h2>
            <p>We collect the following information when you use PostPilot:</p>
            <ul>
              <li><strong style={{ color: '#fff' }}>Account information</strong> — your email address and password (stored securely via Supabase Auth)</li>
              <li><strong style={{ color: '#fff' }}>Social media tokens</strong> — OAuth access tokens for Instagram and LinkedIn so we can post on your behalf</li>
              <li><strong style={{ color: '#fff' }}>Post content</strong> — text, images, and videos you create and schedule through our platform</li>
              <li><strong style={{ color: '#fff' }}>Usage data</strong> — basic logs of when posts are published or fail</li>
            </ul>
          </div>

          <div className="section">
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To authenticate you and keep your account secure</li>
              <li>To publish your scheduled posts to Instagram and LinkedIn on your behalf</li>
              <li>To show you your post history, analytics, and calendar</li>
              <li>To send you important notifications about your account</li>
            </ul>
            <p>We do <strong style={{ color: '#fff' }}>not</strong> sell, rent, or share your personal data with third parties for advertising or marketing purposes.</p>
          </div>

          <div className="section">
            <h2>3. Social Media Platforms</h2>
            <p>When you connect your Instagram or LinkedIn account, we store an OAuth access token. This token allows us to publish posts on your behalf. We only request the minimum permissions needed to publish content.</p>
            <ul>
              <li>Instagram tokens expire after 60 days and must be refreshed</li>
              <li>LinkedIn tokens expire after 60 days and must be refreshed</li>
              <li>You can disconnect any account at any time from your Dashboard</li>
            </ul>
          </div>

          <div className="section">
            <h2>4. Data Storage & Security</h2>
            <p>Your data is stored securely using Supabase (PostgreSQL database) with row-level security enabled. This means each user can only access their own data. Media files are stored in Supabase Storage with access controls.</p>
            <p>We use HTTPS for all data in transit and follow industry best practices for data security.</p>
          </div>

          <div className="section">
            <h2>5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting us or using the disconnect feature in your dashboard.</p>
          </div>

          <div className="section">
            <h2>6. Your Rights</h2>
            <ul>
              <li><strong style={{ color: '#fff' }}>Access</strong> — you can view all your data in your dashboard at any time</li>
              <li><strong style={{ color: '#fff' }}>Deletion</strong> — you can delete your posts and disconnect your accounts from the dashboard</li>
              <li><strong style={{ color: '#fff' }}>Export</strong> — contact us to request a copy of your data</li>
              <li><strong style={{ color: '#fff' }}>Correction</strong> — contact us to correct any inaccurate data</li>
            </ul>
          </div>

          <div className="section">
            <h2>7. Cookies</h2>
            <p>We use essential cookies only — specifically for authentication (keeping you logged in). We do not use tracking or advertising cookies.</p>
          </div>

          <div className="section">
            <h2>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of significant changes by email or through the app. Continued use of PostPilot after changes means you accept the updated policy.</p>
          </div>

          <div className="contact-card">
            <h3>📬 Contact Us</h3>
            <p>If you have any questions about this privacy policy or your data, please contact us at <a href="mailto:sarcastic.socials@gmail.com">sarcastic.socials@gmail.com</a></p>
          </div>
        </div>
      </div>
    </>
  )
}
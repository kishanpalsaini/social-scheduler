import { supabase } from '@/lib/supabase'

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    // Exchange code for token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        })
    })
    const { access_token, expires_in } = await tokenRes.json()

    // Get LinkedIn user ID
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
    })
    const profile = await profileRes.json()

    // Save to Supabase (get user from session)
    await supabase.from('connected_accounts').upsert({
        platform: 'linkedin',
        platform_user_id: profile.sub,
        access_token,
        username: profile.name,
    })

    return Response.redirect('/dashboard')
}
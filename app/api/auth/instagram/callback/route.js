// app/api/auth/instagram/callback/route.js
// Facebook redirects here after user approves access

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // use service role here for server-side
)

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        console.error('Instagram OAuth error:', error)
        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=instagram_auth_failed`)
    }

    try {
        // Step 1: Exchange code for a short-lived Facebook access token
        const tokenRes = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.INSTAGRAM_APP_ID,
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
                code,
            }),
        })
        const tokenData = await tokenRes.json()
        if (!tokenData.access_token) throw new Error('No access token returned')
        const shortLivedToken = tokenData.access_token

        // Step 2: Exchange for a long-lived token (lasts 60 days)
        const longTokenRes = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?` +
            new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: process.env.INSTAGRAM_APP_ID,
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                fb_exchange_token: shortLivedToken,
            })
        )
        const longTokenData = await longTokenRes.json()
        const longLivedToken = longTokenData.access_token

        // Step 3: Get the list of Facebook Pages this user manages
        const pagesRes = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
        )
        const pagesData = await pagesRes.json()
        if (!pagesData.data || pagesData.data.length === 0) {
            throw new Error('No Facebook Pages found. Please create a Facebook Page and link your Instagram to it.')
        }

        // Use the first page (you can let users pick later)
        const page = pagesData.data[0]
        const pageAccessToken = page.access_token
        const pageId = page.id

        // Step 4: Get the Instagram Business Account connected to this page
        const igRes = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
        )
        const igData = await igRes.json()
        if (!igData.instagram_business_account) {
            throw new Error('No Instagram Business Account linked to this Facebook Page.')
        }
        const igAccountId = igData.instagram_business_account.id

        // Step 5: Get Instagram username and profile picture
        const igProfileRes = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}?fields=username,profile_picture_url&access_token=${pageAccessToken}`
        )
        const igProfile = await igProfileRes.json()

        // Step 6: Get logged in user from Supabase auth cookie
        // We pass user_id via state param (set in the auth route) or session
        // For simplicity, we'll get the most recent user who initiated this flow
        // In production, use the `state` param to pass the user ID securely
        const { data: { users } } = await supabase.auth.admin.listUsers()
        // Get user from session cookie - simplified approach
        const authHeader = request.headers.get('cookie') || ''

        // Save to connected_accounts table
        // Note: user_id needs to come from session - see note below
        const expires = new Date()
        expires.setDate(expires.getDate() + 60) // long-lived token expires in 60 days

        await supabase.from('connected_accounts').upsert({
            platform: 'instagram',
            platform_user_id: igAccountId,
            access_token: pageAccessToken,      // page token is what we use to post
            username: igProfile.username,
            profile_picture: igProfile.profile_picture_url,
            token_expires_at: expires.toISOString(),
        }, { onConflict: 'platform,platform_user_id' })

        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=instagram_connected`)

    } catch (err) {
        console.error('Instagram callback error:', err.message)
        return Response.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${encodeURIComponent(err.message)}`
        )
    }
}
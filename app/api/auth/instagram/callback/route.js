// app/api/auth/instagram/callback/route.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const userId = searchParams.get('state') // user ID passed via state param

    if (error) {
        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=instagram_auth_failed`)
    }

    if (!userId) {
        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=No user ID found. Please try again.`)
    }

    try {
        // Step 1: Exchange code for short-lived token
        const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.INSTAGRAM_APP_ID,
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
                code,
            }),
        })

        const tokenData = await tokenRes.json()
        console.log('Token response:', JSON.stringify(tokenData))

        if (!tokenData.access_token) {
            throw new Error(`No access token: ${JSON.stringify(tokenData)}`)
        }

        const shortLivedToken = tokenData.access_token
        const igUserId = tokenData.user_id

        // Step 2: Exchange for long-lived token (60 days)
        const longTokenRes = await fetch(
            `https://graph.instagram.com/access_token?` +
            new URLSearchParams({
                grant_type: 'ig_exchange_token',
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                access_token: shortLivedToken,
            })
        )
        const longTokenData = await longTokenRes.json()
        const longLivedToken = longTokenData.access_token || shortLivedToken

        // Step 3: Get Instagram profile
        const profileRes = await fetch(
            `https://graph.instagram.com/v18.0/${igUserId}?fields=username,profile_picture_url&access_token=${longLivedToken}`
        )
        const profile = await profileRes.json()
        console.log('Profile:', JSON.stringify(profile))

        // Step 4: Save to connected_accounts using userId from state
        const expires = new Date()
        expires.setDate(expires.getDate() + 60)

        const { error: dbError } = await supabase.from('connected_accounts').upsert({
            user_id: userId,
            platform: 'instagram',
            platform_user_id: String(igUserId),
            access_token: longLivedToken,
            username: profile.username,
            profile_picture: profile.profile_picture_url,
            token_expires_at: expires.toISOString(),
        }, { onConflict: 'user_id,platform' })

        if (dbError) throw new Error(`DB error: ${dbError.message}`)

        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=instagram_connected`)

    } catch (err) {
        console.error('Instagram callback error:', err.message)
        return Response.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${encodeURIComponent(err.message)}`
        )
    }
}
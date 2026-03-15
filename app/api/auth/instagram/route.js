// app/api/auth/instagram/route.js
// This redirects user to Facebook/Instagram OAuth login page

export async function GET() {
    const params = new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        scope: [
            'instagram_business_basic',
            'instagram_business_content_publish',
            'instagram_business_manage_messages',
            'instagram_business_manage_comments',
        ].join(','),
        response_type: 'code',
    })

    const url = `https://www.facebook.com/v18.0/dialog/oauth?${params}`
    return Response.redirect(url)
}
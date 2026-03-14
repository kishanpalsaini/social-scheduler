// app/api/auth/instagram/route.js
// This redirects user to Facebook/Instagram OAuth login page

export async function GET() {
    const params = new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        scope: [
            'instagram_basic',
            'instagram_content_publish',
            'instagram_manage_insights',
            'pages_show_list',
            'pages_read_engagement',
        ].join(','),
        response_type: 'code',
    })

    const url = `https://www.facebook.com/v18.0/dialog/oauth?${params}`
    return Response.redirect(url)
}
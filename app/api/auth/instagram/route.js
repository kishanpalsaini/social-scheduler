// app/api/auth/instagram/route.js
export async function GET() {
    const params = new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        scope: 'instagram_business_basic,instagram_business_content_publish',
        response_type: 'code',
    })

    const url = `https://www.instagram.com/oauth/authorize?${params}`
    return Response.redirect(url)
}
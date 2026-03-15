// app/api/cron/route.js
import { createClient } from '@supabase/supabase-js'
import { publishToInstagram } from '@/lib/instagram'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
    const now = new Date().toISOString()
    console.log(`[CRON] Running at ${now}`)

    // Find all posts that are scheduled and due now
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', now)

    if (error) {
        console.error('[CRON] DB error:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
        return Response.json({ message: 'No posts due', processed: 0 })
    }

    console.log(`[CRON] Found ${posts.length} posts to publish`)
    const results = []

    for (const post of posts) {
        await supabase.from('posts').update({ status: 'publishing' }).eq('id', post.id)
        const postResults = []

        for (const platform of post.platforms) {
            try {
                if (platform === 'instagram') {
                    const { data: account } = await supabase
                        .from('connected_accounts')
                        .select('*')
                        .eq('user_id', post.user_id)
                        .eq('platform', 'instagram')
                        .single()

                    if (!account) throw new Error('Instagram account not connected')

                    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
                        throw new Error('Instagram token expired. Please reconnect your account.')
                    }

                    const result = await publishToInstagram(post, account.access_token, account.platform_user_id)

                    await supabase.from('publish_results').insert({
                        post_id: post.id, platform: 'instagram',
                        status: 'success', platform_post_id: result.platform_post_id,
                    })
                    postResults.push({ platform: 'instagram', success: true })

                } else if (platform === 'linkedin') {
                    postResults.push({ platform: 'linkedin', success: false, error: 'Not implemented yet' })
                }

            } catch (err) {
                console.error(`[CRON] Failed to publish to ${platform}:`, err.message)
                await supabase.from('publish_results').insert({
                    post_id: post.id, platform, status: 'failed', error: err.message,
                })
                postResults.push({ platform, success: false, error: err.message })
            }
        }

        const allSuccess = postResults.every(r => r.success)
        await supabase.from('posts').update({
            status: allSuccess ? 'published' : 'failed',
            published_at: new Date().toISOString(),
            error_message: postResults.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`).join(', ') || null,
        }).eq('id', post.id)

        results.push({ post_id: post.id, results: postResults })
    }

    console.log('[CRON] Done:', JSON.stringify(results))
    return Response.json({ processed: posts.length, results })
}
// lib/instagram.js
// All Instagram publishing functions

/**
 * Publish a post to Instagram
 * Handles feed posts, reels, and stories
 */
export async function publishToInstagram(post, accessToken, igAccountId) {
    const { content, media_urls, post_type } = post

    // Get public URLs for media files from Supabase Storage
    const mediaUrl = media_urls && media_urls.length > 0
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-media/${media_urls[0]}`
        : null

    if (post_type === 'story') {
        return await publishStory({ content, mediaUrl, accessToken, igAccountId })
    } else if (post_type === 'reel') {
        return await publishReel({ content, mediaUrl, accessToken, igAccountId })
    } else {
        return await publishFeedPost({ content, mediaUrl, accessToken, igAccountId })
    }
}

/**
 * Publish a regular feed post (image + caption or text only via image)
 */
async function publishFeedPost({ content, mediaUrl, accessToken, igAccountId }) {
    if (!mediaUrl) {
        throw new Error('Instagram feed posts require an image or video.')
    }

    const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i)

    // Step 1: Create media container
    const containerParams = isVideo
        ? { video_url: mediaUrl, caption: content, media_type: 'REELS' }
        : { image_url: mediaUrl, caption: content }

    const containerRes = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...containerParams, access_token: accessToken }),
        }
    )
    const containerData = await containerRes.json()
    if (!containerData.id) throw new Error(`Container creation failed: ${JSON.stringify(containerData)}`)

    // Step 2: Wait for video processing if needed
    if (isVideo) {
        await waitForMediaReady(containerData.id, accessToken)
    }

    // Step 3: Publish the container
    const publishRes = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: containerData.id,
                access_token: accessToken,
            }),
        }
    )
    const publishData = await publishRes.json()
    if (!publishData.id) throw new Error(`Publish failed: ${JSON.stringify(publishData)}`)

    return { success: true, platform_post_id: publishData.id }
}

/**
 * Publish a Reel
 */
async function publishReel({ content, mediaUrl, accessToken, igAccountId }) {
    if (!mediaUrl) throw new Error('Reels require a video file.')

    // Step 1: Create reel container
    const containerRes = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                media_type: 'REELS',
                video_url: mediaUrl,
                caption: content,
                share_to_feed: true,
                access_token: accessToken,
            }),
        }
    )
    const containerData = await containerRes.json()
    if (!containerData.id) throw new Error(`Reel container failed: ${JSON.stringify(containerData)}`)

    // Step 2: Wait for video to process
    await waitForMediaReady(containerData.id, accessToken)

    // Step 3: Publish
    const publishRes = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: containerData.id,
                access_token: accessToken,
            }),
        }
    )
    const publishData = await publishRes.json()
    if (!publishData.id) throw new Error(`Reel publish failed: ${JSON.stringify(publishData)}`)

    return { success: true, platform_post_id: publishData.id }
}

/**
 * Publish a Story
 */
async function publishStory({ mediaUrl, accessToken, igAccountId }) {
    if (!mediaUrl) throw new Error('Stories require an image or video.')

    const isVideo = mediaUrl.match(/\.(mp4|mov)$/i)

    // Step 1: Create story container
    const containerRes = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                media_type: isVideo ? 'VIDEO' : 'IMAGE',
                ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl }),
                access_token: accessToken,
            }),
        }
    )
    const containerData = await containerRes.json()
    if (!containerData.id) throw new Error(`Story container failed: ${JSON.stringify(containerData)}`)

    if (isVideo) await waitForMediaReady(containerData.id, accessToken)

    // Step 2: Publish to stories
    const publishRes = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: containerData.id,
                access_token: accessToken,
            }),
        }
    )
    const publishData = await publishRes.json()
    if (!publishData.id) throw new Error(`Story publish failed: ${JSON.stringify(publishData)}`)

    return { success: true, platform_post_id: publishData.id }
}

/**
 * Poll until video media is ready (Instagram processes videos async)
 * Tries up to 10 times with 5 second intervals = 50 seconds max
 */
async function waitForMediaReady(containerId, accessToken, maxTries = 10) {
    for (let i = 0; i < maxTries; i++) {
        await new Promise(r => setTimeout(r, 5000)) // wait 5 seconds

        const statusRes = await fetch(
            `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusRes.json()

        if (statusData.status_code === 'FINISHED') return true
        if (statusData.status_code === 'ERROR') throw new Error('Media processing failed on Instagram')
        // If IN_PROGRESS or PUBLISHED, keep waiting
    }
    throw new Error('Media processing timed out after 50 seconds')
}
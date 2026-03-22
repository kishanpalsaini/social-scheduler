// lib/instagram.js
// All Instagram publishing functions using Instagram Graph API

/**
 * Publish a post to Instagram
 */
export async function publishToInstagram(post, accessToken, igUserId) {
    const { content, media_urls, post_type } = post

    // Get public URL for media file from Supabase Storage
    const mediaUrl = media_urls && media_urls.length > 0
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-media/${media_urls[0]}`
        : null

    console.log('[Instagram] Publishing post:', { post_type, mediaUrl, igUserId })

    if (post_type === 'story') {
        return await publishStory({ content, mediaUrl, accessToken, igUserId })
    } else if (post_type === 'reel') {
        return await publishReel({ content, mediaUrl, accessToken, igUserId })
    } else {
        return await publishFeedPost({ content, mediaUrl, accessToken, igUserId })
    }
}

/**
 * Publish a regular feed post
 */
async function publishFeedPost({ content, mediaUrl, accessToken, igUserId }) {
    if (!mediaUrl) {
        throw new Error('Instagram feed posts require an image.')
    }

    const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i)

    // Step 1: Create media container
    const containerBody = isVideo
        ? { video_url: mediaUrl, caption: content, media_type: 'REELS' }
        : { image_url: mediaUrl, caption: content }

    console.log('[Instagram] Creating container at:', `https://graph.instagram.com/v21.0/${igUserId}/media`)

    const containerRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...containerBody, access_token: accessToken }),
        }
    )
    const containerData = await containerRes.json()
    console.log('[Instagram] Container response:', JSON.stringify(containerData))

    if (!containerData.id) {
        throw new Error(`Container creation failed: ${JSON.stringify(containerData)}`)
    }

    // Step 2: Wait for video processing
    if (isVideo) {
        await waitForMediaReady(containerData.id, accessToken)
    }

    // Step 3: Publish
    const publishRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
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
    console.log('[Instagram] Publish response:', JSON.stringify(publishData))

    if (!publishData.id) {
        throw new Error(`Publish failed: ${JSON.stringify(publishData)}`)
    }

    return { success: true, platform_post_id: publishData.id }
}

/**
 * Publish a Reel
 */
async function publishReel({ content, mediaUrl, accessToken, igUserId }) {
    if (!mediaUrl) throw new Error('Reels require a video file.')

    const containerRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media`,
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

    await waitForMediaReady(containerData.id, accessToken)

    const publishRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
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
async function publishStory({ mediaUrl, accessToken, igUserId }) {
    if (!mediaUrl) throw new Error('Stories require an image or video.')

    const isVideo = mediaUrl.match(/\.(mp4|mov)$/i)

    const containerRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media`,
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

    const publishRes = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
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
 * Poll until video is ready
 */
async function waitForMediaReady(containerId, accessToken, maxTries = 10) {
    for (let i = 0; i < maxTries; i++) {
        await new Promise(r => setTimeout(r, 5000))
        const statusRes = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const statusData = await statusRes.json()
        if (statusData.status_code === 'FINISHED') return true
        if (statusData.status_code === 'ERROR') throw new Error('Media processing failed on Instagram')
    }
    throw new Error('Media processing timed out')
}
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN

    if (!replicateToken) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not configured. Please add it to your environment variables.' },
        { status: 500 }
      )
    }

    // Using Replicate's Zeroscope v2 XL model for text-to-video
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
        input: {
          prompt: prompt,
          num_frames: 24,
          num_inference_steps: 50,
        }
      })
    })

    const prediction = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: prediction.detail || 'Failed to start video generation' },
        { status: response.status }
      )
    }

    // Poll for completion
    let result = prediction
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        }
      })

      result = await statusResponse.json()
      attempts++

      if (result.status === 'failed') {
        return NextResponse.json(
          { error: 'Video generation failed: ' + (result.error || 'Unknown error') },
          { status: 500 }
        )
      }
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Video generation timed out. Please try again.' },
        { status: 408 }
      )
    }

    return NextResponse.json({
      videoUrl: result.output,
      predictionId: result.id
    })

  } catch (error: any) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

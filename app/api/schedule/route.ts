import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (use database in production)
let schedules: any[] = []

export async function GET(request: NextRequest) {
  return NextResponse.json({ schedules })
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, caption, schedule } = await request.json()

    if (!prompt || !schedule) {
      return NextResponse.json(
        { error: 'Prompt and schedule time are required' },
        { status: 400 }
      )
    }

    const scheduledTime = new Date(schedule)
    if (scheduledTime < new Date()) {
      return NextResponse.json(
        { error: 'Schedule time must be in the future' },
        { status: 400 }
      )
    }

    const newSchedule = {
      id: Date.now().toString(),
      prompt,
      caption,
      scheduledTime: scheduledTime.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    schedules.push(newSchedule)

    // In production, you would:
    // 1. Store this in a database
    // 2. Set up a cron job or scheduled task
    // 3. Use a queue service like Bull or AWS SQS

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
      message: 'Post scheduled successfully!'
    })

  } catch (error: any) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    schedules = schedules.filter(s => s.id !== id)

    return NextResponse.json({ success: true, message: 'Schedule deleted' })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

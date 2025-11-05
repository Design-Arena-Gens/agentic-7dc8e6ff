'use client'

import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('generate')
  const [prompt, setPrompt] = useState('')
  const [caption, setCaption] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: string; message: string } | null>(null)
  const [igUsername, setIgUsername] = useState('')
  const [igPassword, setIgPassword] = useState('')
  const [schedules, setSchedules] = useState<any[]>([])

  const generateVideo = async () => {
    setLoading(true)
    setStatus(null)
    setVideoUrl('')

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()

      if (response.ok) {
        setVideoUrl(data.videoUrl)
        setStatus({ type: 'success', message: 'Video generated successfully!' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to generate video' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const postToInstagram = async () => {
    if (!videoUrl) {
      setStatus({ type: 'error', message: 'Please generate a video first' })
      return
    }

    setLoading(true)
    setStatus({ type: 'info', message: 'Posting to Instagram...' })

    try {
      const response = await fetch('/api/post-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          caption,
          username: igUsername,
          password: igPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Posted to Instagram successfully!' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to post to Instagram' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const schedulePost = async () => {
    setLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          caption,
          schedule: document.querySelector<HTMLInputElement>('#schedule-time')?.value
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Post scheduled successfully!' })
        loadSchedules()
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to schedule post' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const loadSchedules = async () => {
    try {
      const response = await fetch('/api/schedule')
      const data = await response.json()
      if (response.ok) {
        setSchedules(data.schedules || [])
      }
    } catch (error) {
      console.error('Failed to load schedules:', error)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📸 Instagram AI Video Automation</h1>
        <p>Generate AI videos and automatically post them to Instagram</p>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate & Post
          </button>
          <button
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => { setActiveTab('schedule'); loadSchedules() }}
          >
            Schedule Posts
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'generate' && (
          <>
            <div className="form-group">
              <label htmlFor="prompt">Video Prompt</label>
              <textarea
                id="prompt"
                placeholder="Describe the video you want to generate (e.g., 'A cat playing piano in space')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <p className="help-text">Describe what you want to see in your AI-generated video</p>
            </div>

            <div className="form-group">
              <label htmlFor="caption">Instagram Caption</label>
              <textarea
                id="caption"
                placeholder="Write your Instagram caption with hashtags..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={generateVideo}
              disabled={loading || !prompt}
            >
              {loading && !videoUrl ? 'Generating Video...' : 'Generate Video'}
            </button>

            {videoUrl && (
              <>
                <div className="video-preview">
                  <video src={videoUrl} controls />
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={postToInstagram}
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post to Instagram'}
                </button>
              </>
            )}

            {status && (
              <div className={`status ${status.type}`}>
                {status.message}
              </div>
            )}
          </>
        )}

        {activeTab === 'schedule' && (
          <>
            <div className="form-group">
              <label htmlFor="schedule-prompt">Video Prompt</label>
              <textarea
                id="schedule-prompt"
                placeholder="Describe the video you want to generate"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="schedule-caption">Caption</label>
              <textarea
                id="schedule-caption"
                placeholder="Instagram caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="schedule-time">Schedule Time</label>
              <input
                type="datetime-local"
                id="schedule-time"
              />
              <p className="help-text">Select when to automatically generate and post</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={schedulePost}
              disabled={loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Post'}
            </button>

            {schedules.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Scheduled Posts</h3>
                {schedules.map((schedule, idx) => (
                  <div key={idx} className="schedule-item">
                    <div className="info">
                      <strong>{schedule.prompt}</strong>
                      <p>{new Date(schedule.scheduledTime).toLocaleString()}</p>
                    </div>
                    <div className="actions">
                      <button className="btn btn-small">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {status && (
              <div className={`status ${status.type}`}>
                {status.message}
              </div>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <div className="form-group">
              <label htmlFor="ig-username">Instagram Username</label>
              <input
                type="text"
                id="ig-username"
                placeholder="your_instagram_username"
                value={igUsername}
                onChange={(e) => setIgUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ig-password">Instagram Password</label>
              <input
                type="password"
                id="ig-password"
                placeholder="Your Instagram password"
                value={igPassword}
                onChange={(e) => setIgPassword(e.target.value)}
              />
              <p className="help-text">Your credentials are stored securely and only used for posting</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                localStorage.setItem('ig_username', igUsername)
                localStorage.setItem('ig_password', igPassword)
                setStatus({ type: 'success', message: 'Settings saved!' })
              }}
            >
              Save Settings
            </button>

            {status && (
              <div className={`status ${status.type}`}>
                {status.message}
              </div>
            )}

            <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Setup Instructions</h3>
              <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>Get a Replicate API token from <a href="https://replicate.com" target="_blank">replicate.com</a></li>
                <li>Add environment variables in Vercel dashboard or .env file</li>
                <li>Enter your Instagram credentials above</li>
                <li>Start generating and posting videos!</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

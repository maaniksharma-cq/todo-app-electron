import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { videoService } from '@renderer/services/video.service'
import { type VideoMetadata } from '../../../../shared/types'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { ArrowLeft, Video, Film, Music } from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function formatBitrate(bps: number): string {
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`
  return `${(bps / 1_000).toFixed(0)} Kbps`
}

function formatFrameRate(r: string): string {
  const [num, den] = r.split('/').map(Number)
  if (!den) return r
  return `${(num / den).toFixed(2)} fps`
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

const VideoMetadataPage = () => {
  const navigate = useNavigate()
  const [filePath, setFilePath] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePickAndAnalyze = async () => {
    setError(null)
    setMetadata(null)
    const picked = await videoService.openFile()
    if (!picked) return
    setFilePath(picked)
    setLoading(true)
    try {
      const result = await videoService.getMetadata(picked)
      setMetadata(result)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const videoStreams = metadata?.streams.filter((s) => s.codec_type === 'video') ?? []
  const audioStreams = metadata?.streams.filter((s) => s.codec_type === 'audio') ?? []

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/')}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Video Metadata</h1>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Button onClick={handlePickAndAnalyze} disabled={loading} size="sm">
            <Video className="size-4 mr-1" />
            {loading ? 'Analyzing…' : 'Pick & Analyze'}
          </Button>
          {filePath && !loading && (
            <span className="text-sm text-muted-foreground truncate max-w-xs" title={filePath}>
              {filePath.split(/[\\/]/).pop()}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {metadata && (
          <div className="space-y-4">
            <Section icon={Video} title="Container">
              <Row label="Format" value={metadata.format} />
              <Row label="Duration" value={formatDuration(metadata.duration)} />
              <Row label="File Size" value={formatSize(metadata.size)} />
              <Row label="Bitrate" value={formatBitrate(metadata.bitrate)} />
            </Section>

            {videoStreams.map((s, i) => (
              <Section key={s.index} icon={Film} title={`Video Stream ${videoStreams.length > 1 ? i + 1 : ''}`}>
                <Row label="Codec" value={s.codec_name} />
                {s.width && s.height && (
                  <Row label="Resolution" value={`${s.width} × ${s.height}`} />
                )}
                {s.r_frame_rate && (
                  <Row label="Frame Rate" value={formatFrameRate(s.r_frame_rate)} />
                )}
              </Section>
            ))}

            {audioStreams.map((s, i) => (
              <Section key={s.index} icon={Music} title={`Audio Stream ${audioStreams.length > 1 ? i + 1 : ''}`}>
                <Row label="Codec" value={s.codec_name} />
                {s.sample_rate && <Row label="Sample Rate" value={`${s.sample_rate} Hz`} />}
                {s.channels != null && <Row label="Channels" value={s.channels} />}
              </Section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoMetadataPage

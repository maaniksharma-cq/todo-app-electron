import { dialog, app } from 'electron'
import { execFile } from 'child_process'
import { join } from 'path'
import * as fs from 'fs'
import { type VideoMetadata } from '../../../shared/types'

function getFfprobePath(): string {
  const name =
    process.platform === 'win32'
      ? `ffprobe-${process.platform}-${process.arch}.exe`
      : `ffprobe-${process.platform}-${process.arch}`

  return app.isPackaged
    ? join(process.resourcesPath, 'bin', name)
    : join(__dirname, '../../extra/bin', name)
}

export async function openVideoFileHandler(): Promise<string | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select a video file',
    filters: [
      {
        name: 'Videos',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v']
      }
    ],
    properties: ['openFile']
  })
  return canceled ? null : filePaths[0]
}

export async function getVideoMetadataHandler(filePath: string): Promise<VideoMetadata> {
  const ffprobePath = getFfprobePath()

  if (!fs.existsSync(ffprobePath)) {
    throw new Error(`ffprobe binary not found: ${ffprobePath}`)
  }

  if (process.platform !== 'win32') {
    fs.chmodSync(ffprobePath, 0o755)
  }

  return new Promise((resolve, reject) => {
    execFile(
      ffprobePath,
      ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath],
      (error, stdout) => {
        if (error) {
          reject(error)
          return
        }
        try {
          const data = JSON.parse(stdout)
          const fmt = data.format
          resolve({
            filename: fmt.filename,
            format: fmt.format_long_name ?? fmt.format_name,
            duration: parseFloat(fmt.duration ?? '0'),
            size: parseInt(fmt.size ?? '0', 10),
            bitrate: parseInt(fmt.bit_rate ?? '0', 10),
            streams: (data.streams ?? []).map(
              (s: {
                index: number
                codec_type: string
                codec_name: string
                width?: number
                height?: number
                r_frame_rate?: string
                sample_rate?: string
                channels?: number
              }) => ({
                index: s.index,
                codec_type: s.codec_type,
                codec_name: s.codec_name,
                width: s.width,
                height: s.height,
                r_frame_rate: s.r_frame_rate,
                sample_rate: s.sample_rate,
                channels: s.channels
              })
            )
          })
        } catch (e) {
          reject(new Error(`Failed to parse ffprobe output: ${e}`))
        }
      }
    )
  })
}

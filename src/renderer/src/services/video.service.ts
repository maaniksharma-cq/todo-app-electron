import { ipc } from './ipc'
import { IPC_CHANNELS, type VideoMetadata } from '../../../../shared/types'

export const videoService = {
  openFile: () => ipc.invoke<string | null>(IPC_CHANNELS.OPEN_VIDEO_FILE),
  getMetadata: (filePath: string) =>
    ipc.invoke<VideoMetadata>(IPC_CHANNELS.GET_VIDEO_METADATA, filePath)
}

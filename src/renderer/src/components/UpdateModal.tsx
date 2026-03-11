import { useEffect, useState } from 'react'
import { ipc } from '@renderer/services/ipc'
import { IPC_CHANNELS } from '../../../../shared/types'

type UpdateStatus = 'checking' | 'available' | 'downloaded' | 'error' | null

export function UpdateModal() {
  const [status, setStatus] = useState<UpdateStatus>(null)

  useEffect(() => {
    const unsubChecking = ipc.on(IPC_CHANNELS.UPDATE_CHECKING, () => setStatus('checking'))
    const unsubAvailable = ipc.on(IPC_CHANNELS.UPDATE_AVAILABLE, () => setStatus('available'))
    const unsubNotAvailable = ipc.on(IPC_CHANNELS.UPDATE_NOT_AVAILABLE, () => setStatus(null))
    const unsubDownloaded = ipc.on(IPC_CHANNELS.UPDATE_DOWNLOADED, () => {
      setStatus('downloaded')
      setTimeout(() => setStatus(null), 3000)
    })
    const unsubError = ipc.on(IPC_CHANNELS.UPDATE_ERROR, () => {
      setStatus('error')
      setTimeout(() => setStatus(null), 4000)
    })

    return () => {
      unsubChecking()
      unsubAvailable()
      unsubNotAvailable()
      unsubDownloaded()
      unsubError()
    }
  }, [])

  if (!status) return null

  const content: Record<NonNullable<UpdateStatus>, { message: string; showSpinner: boolean }> = {
    checking: { message: 'Checking for updates…', showSpinner: true },
    available: { message: 'Downloading update…', showSpinner: true },
    downloaded: { message: 'Update downloaded. Restart to apply.', showSpinner: false },
    error: { message: 'Update check failed.', showSpinner: false }
  }

  const { message, showSpinner } = content[status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-background border rounded-xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 min-w-[260px]">
        {showSpinner && (
          <div className="size-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
        )}
        <p className="text-sm font-medium text-center">{message}</p>
      </div>
    </div>
  )
}

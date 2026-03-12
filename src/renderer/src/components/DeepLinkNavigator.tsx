import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ipc } from '@renderer/services/ipc'
import { IPC_CHANNELS } from '../../../../shared/types'

export function DeepLinkNavigator(): null {
	const navigate = useNavigate()

	useEffect(() => {
		console.log('[deeplink] DeepLinkNavigator mounted, listening for', IPC_CHANNELS.DEEPLINK_NAVIGATE)
		const unsubscribe = ipc.on(IPC_CHANNELS.DEEPLINK_NAVIGATE, (...args: unknown[]) => {
			const path = args[0] as string
			console.log('[deeplink] renderer received navigate:', path)
			navigate(path)
		})
		return () => unsubscribe()
	}, [navigate])

	return null
}

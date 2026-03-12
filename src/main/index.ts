import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initDatabase, closeDatabase } from './database'
import { registerIpcHandlers } from './ipc'
import { autoUpdater } from 'electron-updater'
import { IPC_CHANNELS } from '../../shared/types'

let mainWindow: BrowserWindow | null = null

function parseDeepLinkPath(url: string): string | null {
	try {
		const parsed = new URL(url.replace('todoapp://', 'http://todoapp/'))
		console.log('[deeplink] parseDeepLinkPath input:', url, '→ pathname:', parsed.pathname)
		return parsed.pathname
	} catch (e) {
		console.error('[deeplink] parseDeepLinkPath failed:', e)
		return null
	}
}

function sendDeepLinkNavigation(win: BrowserWindow, path: string): void {
	const isLoading = win.webContents.isLoading()
	console.log('[deeplink] sendDeepLinkNavigation path:', path, '| isLoading:', isLoading)
	if (isLoading) {
		win.webContents.once('did-finish-load', () => {
			console.log('[deeplink] did-finish-load, sending now')
			win.webContents.send(IPC_CHANNELS.DEEPLINK_NAVIGATE, path)
		})
	} else {
		win.webContents.send(IPC_CHANNELS.DEEPLINK_NAVIGATE, path)
	}
}

function setupAutoUpdater(win: BrowserWindow): void {
	autoUpdater.autoDownload = true
	autoUpdater.autoInstallOnAppQuit = true

	if (is.dev) {
		autoUpdater.forceDevUpdateConfig = true
	}

	autoUpdater.on('checking-for-update', () => {
		win.webContents.send(IPC_CHANNELS.UPDATE_CHECKING)
	})

	autoUpdater.on('update-available', () => {
		win.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE)
	})

	autoUpdater.on('update-not-available', () => {
		win.webContents.send(IPC_CHANNELS.UPDATE_NOT_AVAILABLE)
	})

	autoUpdater.on('update-downloaded', () => {
		win.webContents.send(IPC_CHANNELS.UPDATE_DOWNLOADED)
		dialog
			.showMessageBox(win, {
				type: 'info',
				title: 'Update Ready',
				message: 'A new version has been downloaded. Restart the app to apply the update.',
				buttons: ['Restart Now', 'Later']
			})
			.then(({ response }) => {
				if (response === 0) {
					autoUpdater.quitAndInstall()
				}
			})
	})

	autoUpdater.on('error', (err) => {
		console.error('Auto-updater error:', err)
		win.webContents.send(IPC_CHANNELS.UPDATE_ERROR, err.message)
	})

	setTimeout(() => {
		if (process.platform !== 'darwin') {
			autoUpdater.checkForUpdatesAndNotify().catch(console.error)
		} else {
			autoUpdater.checkForUpdates().catch(console.error)
		}
	}, 3000)
}

function createWindow(): BrowserWindow {
	mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false
		}
	})

	mainWindow.on('ready-to-show', () => {
		mainWindow!.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}

	return mainWindow
}

// Single-instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
	app.quit()
}

// Windows/Linux: second-instance handler
app.on('second-instance', (_event, argv) => {
	const url = argv.find((arg) => arg.startsWith('todoapp://'))
	if (url && mainWindow) {
		const path = parseDeepLinkPath(url)
		if (path) {
			if (mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
			sendDeepLinkNavigation(mainWindow, path)
		}
	}
})

// macOS: open-url handler
app.on('open-url', (event, url) => {
	console.log('[deeplink] open-url fired:', url)
	event.preventDefault()
	const path = parseDeepLinkPath(url)
	console.log('[deeplink] parsed path:', path, '| mainWindow exists:', !!mainWindow)
	if (path && mainWindow) {
		mainWindow.focus()
		sendDeepLinkNavigation(mainWindow, path)
	}
})

app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron')

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	// Protocol registration
	if (is.dev && process.platform === 'darwin') {
		app.setAsDefaultProtocolClient('todoapp', process.execPath, [
			'--inspect=5858',
			app.getAppPath()
		])
	} else {
		app.setAsDefaultProtocolClient('todoapp')
	}

	initDatabase()
	registerIpcHandlers()
	const win = createWindow()
	setupAutoUpdater(win)

	// Cold-start argv (Windows/Linux)
	if (process.platform !== 'darwin') {
		const url = process.argv.find((arg) => arg.startsWith('todoapp://'))
		if (url) {
			const path = parseDeepLinkPath(url)
			if (path && mainWindow) sendDeepLinkNavigation(mainWindow, path)
		}
	}

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('before-quit', () => {
	closeDatabase()
})

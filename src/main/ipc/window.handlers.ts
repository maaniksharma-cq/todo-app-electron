import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let createTodoWin: BrowserWindow | null = null

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows.find((w) => w !== createTodoWin) ?? null
}

export const openCreateTodoWindowHandler = (): void => {
  if (createTodoWin) {
    createTodoWin.focus()
    return
  }

  const parent = getMainWindow()

  createTodoWin = new BrowserWindow({
    width: 500,
    height: 450,
    parent: parent ?? undefined,
    modal: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const base = process.env['ELECTRON_RENDERER_URL'].replace(/\/?$/, '/')
    createTodoWin.loadURL(`${base}#/createTodo`)
  } else {
    createTodoWin.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/createTodo' })
  }

  createTodoWin.on('closed', () => {
    createTodoWin = null
  })
}

export const closeCreateTodoWindowHandler = (): void => {
  if (createTodoWin) {
    const mainWin = getMainWindow()
    createTodoWin.close()
    createTodoWin = null
    // Notify main window to refresh the todo list
    mainWin?.webContents.send('todos:refresh')
  }
}

import { ipcMain, app } from 'electron'
import { fork } from 'child_process'
import { join } from 'path'
import { IPC_CHANNELS, type CreateTodoInput, type UpdateTodoInput } from '../../../shared/types'
import { createTodoHandler, getTodosHandler, updateTodoHandler, deleteTodoHandler, getTodoByIdHandler } from './todo.handlers'
import { openCreateTodoWindowHandler, closeCreateTodoWindowHandler } from './window.handlers'

export function registerIpcHandlers(): void {
  // todo handlers
  ipcMain.handle(IPC_CHANNELS.GET_TODOS, () => getTodosHandler())
  ipcMain.handle(IPC_CHANNELS.CREATE_TODO, (_event, todo: CreateTodoInput) => createTodoHandler(todo))
  ipcMain.handle(IPC_CHANNELS.UPDATE_TODO, (_event, todo: UpdateTodoInput) => updateTodoHandler(todo))
  ipcMain.handle(IPC_CHANNELS.DELETE_TODO, (_event, id: number) => deleteTodoHandler(id))
  ipcMain.handle(IPC_CHANNELS.GET_TODO_BY_ID, (_event, id: number) => getTodoByIdHandler(id))

  // window handlers
  ipcMain.handle(IPC_CHANNELS.OPEN_CREATE_WINDOW, () => openCreateTodoWindowHandler())
  ipcMain.handle(IPC_CHANNELS.CLOSE_CREATE_WINDOW, () => closeCreateTodoWindowHandler())

  // system info handler
  ipcMain.handle(IPC_CHANNELS.GET_SYSTEM_INFO, () => {
    const workerPath = app.isPackaged
      ? join(process.resourcesPath, 'worker.js')
      : join(__dirname, '../../extra/worker.js')
    return new Promise((resolve, reject) => {
      const worker = fork(workerPath)
      worker.send('get-system-info')
      worker.on('message', (msg: { type: string; data: unknown }) => {
        if (msg.type === 'system-info') {
          worker.kill()
          resolve(msg.data)
        }
      })
      worker.on('error', (err) => {
        worker.kill()
        reject(err)
      })
    })
  })
}

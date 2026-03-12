import { ipcMain } from 'electron'
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
}

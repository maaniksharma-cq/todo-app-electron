import { ipc } from './ipc'
import {
  IPC_CHANNELS,
  TodoSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
  type Todo,
  type CreateTodoInput,
  type UpdateTodoInput
} from '../../../../shared/types'
import { z } from 'zod/v4'

export const todoService = {
  async getAll(): Promise<Todo[]> {
    const result = await ipc.invoke<unknown[]>(IPC_CHANNELS.GET_TODOS)
    return z.array(TodoSchema).parse(result)
  },

  async create(input: CreateTodoInput): Promise<void> {
    const validated = CreateTodoSchema.parse(input)
    await ipc.invoke(IPC_CHANNELS.CREATE_TODO, validated)
  },

  async update(input: UpdateTodoInput): Promise<void> {
    const validated = UpdateTodoSchema.parse(input)
    await ipc.invoke(IPC_CHANNELS.UPDATE_TODO, validated)
  },

  async delete(id: number): Promise<void> {
    const validated = z.number().parse(id)
    await ipc.invoke(IPC_CHANNELS.DELETE_TODO, validated)
  },

  async openCreateWindow(): Promise<void> {
    await ipc.invoke(IPC_CHANNELS.OPEN_CREATE_WINDOW)
  },

  async closeCreateWindow(): Promise<void> {
    await ipc.invoke(IPC_CHANNELS.CLOSE_CREATE_WINDOW)
  }
}

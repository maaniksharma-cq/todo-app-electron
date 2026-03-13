import { z } from "zod/v4"

// ---- IPC Channel Definitions ----
export const IPC_CHANNELS = {
  GET_TODOS: 'todo:getAll',
  CREATE_TODO: 'todo:create',
  UPDATE_TODO: 'todo:update',
  DELETE_TODO: 'todo:delete',
  GET_TODO_BY_ID: 'todo:getById',
  DEEPLINK_NAVIGATE: 'deeplink:navigate',
  OPEN_CREATE_WINDOW: 'window:openCreateTodo',
  CLOSE_CREATE_WINDOW: 'window:closeCreateTodo',
  UPDATE_CHECKING: 'update:checking',
  UPDATE_AVAILABLE: 'update:available',
  UPDATE_NOT_AVAILABLE: 'update:not-available',
  UPDATE_DOWNLOADED: 'update:downloaded',
  UPDATE_ERROR: 'update:error',
  GET_SYSTEM_INFO: 'system:getInfo',
  OPEN_VIDEO_FILE: 'video:openFile',
  GET_VIDEO_METADATA: 'video:getMetadata',
} as const

export interface VideoStream {
  index: number
  codec_type: string
  codec_name: string
  width?: number
  height?: number
  r_frame_rate?: string
  sample_rate?: string
  channels?: number
}

export interface VideoMetadata {
  filename: string
  format: string
  duration: number
  size: number
  bitrate: number
  streams: VideoStream[]
}

// ---- Zod Schemas ----
export const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  completed: z.union([z.boolean(), z.number()]).transform((v) => Boolean(v)),
  created_at: z.string(),
})

export const CreateTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  completed: z.boolean().optional().default(false),
})

export const UpdateTodoSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  completed: z.boolean(),
})

// ---- Inferred Types ----
export type Todo = z.infer<typeof TodoSchema>
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>

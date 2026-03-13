import { ipc } from './ipc'
import { IPC_CHANNELS } from '../../../../shared/types'

export interface HardwareInfo {
  chipName: string | null
  modelName: string | null
  modelIdentifier: string | null
  serialNumber: string | null
  physicalMemory: string | null
}

export interface SystemInfo {
  platform: string
  arch: string
  hostname: string
  osVersion: string
  cpuModel: string
  cpuCount: number
  totalMemory: number
  freeMemory: number
  uptime: number
  hardwareInfo: HardwareInfo | null
}

export const systemService = {
  async get(): Promise<SystemInfo> {
    return ipc.invoke<SystemInfo>(IPC_CHANNELS.GET_SYSTEM_INFO)
  }
}

// Typed wrapper around window.ipcRenderer.
// Components import from here instead of touching window directly.

function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  return window.ipcRenderer.invoke(channel, ...args) as Promise<T>
}

function send(channel: string, ...args: unknown[]): void {
  window.ipcRenderer.send(channel, ...args)
}

function on(channel: string, callback: (...args: unknown[]) => void) {
  const listener = (_event: unknown, ...args: unknown[]) => callback(...args)
  window.ipcRenderer.on(channel, listener)
  return () => window.ipcRenderer.off(channel, listener)
}

export const ipc = { invoke, send, on }

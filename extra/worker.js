const os = require('os')
const { execFile } = require('child_process')

function getBaseInfo() {
  const cpus = os.cpus()
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    osVersion: os.version(),
    cpuModel: cpus[0]?.model ?? 'Unknown',
    cpuCount: cpus.length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
  }
}

function getMacHardwareInfo() {
  return new Promise((resolve) => {
    execFile('system_profiler', ['SPHardwareDataType', '-json'], { timeout: 10000 }, (err, stdout) => {
      if (err) {
        resolve(null)
        return
      }
      try {
        const parsed = JSON.parse(stdout)
        const hw = parsed?.SPHardwareDataType?.[0] ?? {}
        resolve({
          chipName: hw.chip_type ?? hw.cpu_type ?? null,
          modelName: hw.machine_name ?? null,
          modelIdentifier: hw.machine_model ?? null,
          serialNumber: hw.serial_number ?? null,
          physicalMemory: hw.physical_memory ?? null,
        })
      } catch {
        resolve(null)
      }
    })
  })
}

function getWindowsHardwareInfo() {
  return new Promise((resolve) => {
    const script = `
      $cs = Get-WmiObject Win32_ComputerSystem | Select-Object Model, Manufacturer, TotalPhysicalMemory
      $bios = Get-WmiObject Win32_BIOS | Select-Object SerialNumber
      $cpu = Get-WmiObject Win32_Processor | Select-Object -First 1 Name
      [PSCustomObject]@{
        modelName       = "$($cs.Manufacturer) $($cs.Model)".Trim()
        modelIdentifier = $cs.Model
        chipName        = $cpu.Name
        serialNumber    = $bios.SerialNumber
        physicalMemory  = [math]::Round($cs.TotalPhysicalMemory / 1GB, 0).ToString() + " GB"
      } | ConvertTo-Json
    `
    execFile('powershell', ['-NoProfile', '-NonInteractive', '-Command', script],
      { timeout: 10000 },
      (err, stdout) => {
        if (err) { resolve(null); return }
        try {
          const parsed = JSON.parse(stdout)
          resolve({
            chipName:        parsed.chipName        ?? null,
            modelName:       parsed.modelName       ?? null,
            modelIdentifier: parsed.modelIdentifier ?? null,
            serialNumber:    parsed.serialNumber    ?? null,
            physicalMemory:  parsed.physicalMemory  ?? null,
          })
        } catch { resolve(null) }
      }
    )
  })
}

process.on('message', async (msg) => {
  if (msg !== 'get-system-info') return

  const base = getBaseInfo()
  let hardwareInfo = null
  if (base.platform === 'darwin') hardwareInfo = await getMacHardwareInfo()
  if (base.platform === 'win32')  hardwareInfo = await getWindowsHardwareInfo()

  process.send({
    type: 'system-info',
    data: { ...base, hardwareInfo },
  })
})

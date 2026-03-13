import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { systemService, type SystemInfo } from '@renderer/services/system.service'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { ArrowLeft, Cpu, HardDrive, Monitor, Server } from 'lucide-react'

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3
  return `${gb.toFixed(1)} GB`
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

const SystemInfoPage = () => {
  const navigate = useNavigate()
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    systemService.get()
      .then(setInfo)
      .catch((e) => setError(String(e)))
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/')}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">System Info</h1>
        </div>

        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {!info && !error && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {info && (
          <div className="space-y-4">
            {info.hardwareInfo && (
              <Section icon={Monitor} title="Hardware">
                <Row label="Model" value={info.hardwareInfo.modelName} />
                <Row label="Identifier" value={info.hardwareInfo.modelIdentifier} />
                <Row label="Chip" value={info.hardwareInfo.chipName} />
                <Row label="Memory" value={info.hardwareInfo.physicalMemory} />
                <Row label="Serial" value={info.hardwareInfo.serialNumber} />
              </Section>
            )}

            <Section icon={Cpu} title="CPU">
              <Row label="Model" value={info.cpuModel} />
              <Row label="Cores" value={info.cpuCount} />
              <Row label="Architecture" value={info.arch} />
            </Section>

            <Section icon={HardDrive} title="Memory">
              <Row label="Total" value={formatBytes(info.totalMemory)} />
              <Row label="Free" value={formatBytes(info.freeMemory)} />
              <Row label="Used" value={formatBytes(info.totalMemory - info.freeMemory)} />
            </Section>

            <Section icon={Server} title="OS">
              <Row label="Platform" value={info.platform} />
              <Row label="Version" value={info.osVersion} />
              <Row label="Hostname" value={info.hostname} />
              <Row label="Uptime" value={formatUptime(info.uptime)} />
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

export default SystemInfoPage

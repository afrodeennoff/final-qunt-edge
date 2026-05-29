'use client'

import { generateAdminApiKey } from '@/server/mcp-key-service'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { unifiedInsetPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'
import { Key, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function AdminApiKeyGenerator() {
  const [name, setName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsCreating(true)
    const result = await generateAdminApiKey(name.trim())
    if (result.success) {
      setCreatedKey(result.result.key)
      setName('')
      toast.success('Admin API key created')
    } else {
      toast.error(result.error || 'Failed to create key')
    }
    setIsCreating(false)
  }
  return (
    <Card className="border-border/20 bg-gradient-to-br from-card/50 to-card/10 ring-1 ring-inset ring-white/[0.02]">
      <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Admin API Keys</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {createdKey ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Admin API Key (show once):</p>
            <div className={cn(unifiedInsetPanelClassName, 'p-3')}>
              <code className="flex-1 text-xs break-all select-all">{createdKey}</code>
              <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(createdKey); toast.success('Copied!') }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-destructive">This key grants full admin access. Store it securely.</p>
            {origin && (
              <div className={cn(unifiedInsetPanelClassName, 'p-3 text-xs text-muted-foreground space-y-2')}>
                <p className="font-semibold text-foreground">Admin MCP Endpoint</p>
                <div className={cn(unifiedInsetPanelClassName, 'rounded p-2 bg-background/50')}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="flex-1 break-all font-mono text-[10px] text-foreground/80">{origin}/api/mcp/admin</code>
                    <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => { navigator.clipboard.writeText(`${origin}/api/mcp/admin`); toast.success('URL copied!') }}>
                      <Copy className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                  <p className="text-[10px] font-medium text-foreground/70">Admin (use this with admin keys)</p>
                  <p className="text-[9px] text-muted-foreground/70">Full admin access — users, subscriptions, analytics</p>
                </div>
              </div>
            )}
            <Button variant="outline" onClick={() => setCreatedKey(null)}>Create Another</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input placeholder="Key name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>Generate Admin Key</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

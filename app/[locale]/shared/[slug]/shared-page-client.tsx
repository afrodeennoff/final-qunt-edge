'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  unifiedChipClassName,
  unifiedInsetPanelClassName,
  unifiedMetricPanelClassName,
  unifiedSectionPanelClassName
} from '@/components/layout/unified-page-recipes'
import { format } from 'date-fns'
import { useData } from '@/context/data-provider'
import { SharedWidgetCanvas } from './shared-widget-canvas'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import {
  Loader2,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react'
import { MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'
import { motion } from 'motion/react'
import { EmptyState } from '@/components/ui/empty-state'

// Enhanced Accounts Selector with Better UX
function AccountsSelector({ accounts }: { accounts: any[] }) {
  const { accountNumbers, setAccountNumbers } = useData()
  const t = useI18n()
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  const visibleAccounts = isExpanded ? accounts : accounts.slice(0, 3)
  const remainingAccounts = accounts.length - 3

  useEffect(() => {
    setSelectAll(accountNumbers.length === accounts.length && accounts.length > 0)
  }, [accountNumbers, accounts.length])

  const toggleAccount = (account: string) => {
    if (accountNumbers.includes(account)) {
      setAccountNumbers(accountNumbers.filter((a: string) => a !== account))
    } else {
      setAccountNumbers([...accountNumbers, account])
    }
  }

  const toggleAll = () => {
    if (selectAll) {
      setAccountNumbers([])
    } else {
      setAccountNumbers([...accounts])
    }
    setSelectAll(!selectAll)
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Trading Accounts</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {accountNumbers.length}/{accounts.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Show Less' : `Show ${remainingAccounts} More`}
            <ChevronDown
              className={cn(
                'h-3 w-3 ml-1 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Select accounts to view their trading performance
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {visibleAccounts.map((account) => (
            <MotionStaggerItem key={account}>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:border-primary/40 transition-all cursor-pointer bg-muted/30"
                   onClick={() => toggleAccount(account)}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    accountNumbers.includes(account)
                      ? "bg-primary ring-2 ring-primary/20"
                      : "bg-muted-foreground/30"
                  )} />
                  <span className="text-sm font-medium">Account {account}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 text-xs",
                    accountNumbers.includes(account)
                      ? "text-primary bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleAccount(account)
                  }}
                >
                  {accountNumbers.includes(account) ? 'Selected' : 'Select'}
                </Button>
              </div>
            </MotionStaggerItem>
          ))}
          {accounts.length > 3 && !isExpanded && (
            <div className="text-center text-xs text-muted-foreground py-2">
              +{remainingAccounts} more accounts
            </div>
          )}
        </div>

        {accounts.length > 1 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="w-full h-8 text-xs"
            >
              {selectAll ? 'Deselect All Accounts' : 'Select All Accounts'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Dashboard Header with Performance Summary
function DashboardHeader() {
  const t = useI18n()

  // Mock data for demo - in real app this would come from shared API
  const totalTrades = 1247
  const winRate = 64.2
  const totalPnL = 15738.42
  const avgTrade = 12.63

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MotionStaggerItem>
        <Card className="border-border/30 bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Trades</p>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {totalTrades.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <Card className="border-border/30 bg-gradient-to-br from-success/5 to-success/0 border border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold text-success tabular-nums">
                  {winRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <Card className="border-border/30 bg-gradient-to-br from-amber/5 to-amber/0 border border-amber/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber/10">
                <DollarSign className="h-4 w-4 text-amber" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total P&L</p>
                <p className={cn(
                  "text-lg font-bold tabular-nums",
                  totalPnL >= 0 ? "text-success" : "text-destructive"
                )}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <Card className="border-border/30 bg-gradient-to-br from-blue/5 to-blue/0 border border-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue/10">
                <PieChart className="h-4 w-4 text-blue" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Trade</p>
                <p className={cn(
                  "text-lg font-bold tabular-nums",
                  avgTrade >= 0 ? "text-success" : "text-destructive"
                )}>
                  {avgTrade >= 0 ? '+' : ''}{avgTrade.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionStaggerItem>
    </div>
  )
}

// Main Shared Page Component
export function SharedPageClient() {
  const {
    isLoading,
    accountNumbers,
    accounts,
    isSharedView
  } = useData()
  const t = useI18n()
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Loading shared trading performance...</p>
        </div>
      </div>
    )
  }

  if (!isSharedView) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          title="Shared View Not Available"
          description="This page requires a valid shared trading performance link."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/0 to-muted/10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/30 bg-card/80 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Shared Trading Performance
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View comprehensive trading analytics and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Public Dashboard
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {accountNumbers.length > 0 ? `${accountNumbers.length} account${accountNumbers.length > 1 ? 's' : ''} selected` : 'No accounts selected'}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Accounts Selector */}
        <MotionStaggerItem>
          <AccountsSelector accounts={accounts || []} />
        </MotionStaggerItem>

        {/* Main Content */}
        <MotionStaggerItem>
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm mt-6">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList className="grid w-full max-w-md h-10">
                    <TabsTrigger
                      value="overview"
                      className="text-xs font-medium transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20"
                    >
                      <BarChart3 className="h-3 w-3 mr-1.5" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="performance"
                      className="text-xs font-medium transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20"
                    >
                      <TrendingUp className="h-3 w-3 mr-1.5" />
                      Performance
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="text-xs font-medium transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20"
                    >
                      <PieChart className="h-3 w-3 mr-1.5" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="mt-6">
                  <SharedWidgetCanvas />
                </TabsContent>

                <TabsContent value="performance" className="mt-6">
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                    <p className="text-muted-foreground">Performance analytics coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <div className="text-center py-12">
                    <PieChart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground">Advanced analytics coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </MotionStaggerItem>
      </div>
    </div>
  )
}
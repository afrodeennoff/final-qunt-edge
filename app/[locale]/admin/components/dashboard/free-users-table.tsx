'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getFreeUsers } from '../../actions/stats'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { Trade } from "@/lib/data-types"

interface FreeUser {
  email: string
  trades: Trade[]
}

interface SortConfig {
  key: keyof FreeUser | 'tradeCount' | 'tradeStart' | 'tradeLast'
  direction: 'asc' | 'desc'
}

function getEarliestEntryDate(trades: Trade[]) {
  return trades.reduce((earliest, trade) =>
    trade.entryDate < earliest ? trade.entryDate : earliest,
    trades[0]?.entryDate
  )
}

function getLatestEntryDate(trades: Trade[]) {
  return trades.reduce((latest, trade) =>
    trade.entryDate > latest ? trade.entryDate : latest,
    trades[0]?.entryDate
  )
}

function compareEntryDates(a?: Date | string | null, b?: Date | string | null) {
  if (!a || !b) return 0
  const aTime = new Date(a).getTime()
  const bTime = new Date(b).getTime()
  return aTime - bTime
}

function compareUsers(a: FreeUser, b: FreeUser, sortConfig: SortConfig) {
  if (sortConfig.key === 'tradeCount') {
    return sortConfig.direction === 'asc'
      ? a.trades.length - b.trades.length
      : b.trades.length - a.trades.length
  }

  if (sortConfig.key === 'tradeStart') {
    const result = compareEntryDates(getEarliestEntryDate(a.trades), getEarliestEntryDate(b.trades))
    return sortConfig.direction === 'asc' ? result : -result
  }

  if (sortConfig.key === 'tradeLast') {
    const result = compareEntryDates(getLatestEntryDate(a.trades), getLatestEntryDate(b.trades))
    return sortConfig.direction === 'asc' ? result : -result
  }

  return sortConfig.direction === 'asc'
    ? a.email.localeCompare(b.email)
    : b.email.localeCompare(a.email)
}

export function FreeUsersTable() {
  const [users, setUsers] = useState<FreeUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'email',
    direction: 'asc'
  })

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getFreeUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load free users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
  }, [])

  const sortData = (data: FreeUser[]) => {
    return [...data].sort((a, b) => compareUsers(a, b, sortConfig))
  }

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <div className="space-y-4">
      <Button onClick={fetchUsers} variant="outline">
        Refresh
      </Button>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1"
                >
                  Email
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('tradeCount')}
                  className="flex items-center gap-1"
                >
                  Trades
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('tradeStart')}
                  className="flex items-center gap-1"
                >
                  startDate
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('tradeLast')}
                  className="flex items-center gap-1"
                >
                  lastDate
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  Loading free users...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                  No free users found.
                </TableCell>
              </TableRow>
            )}
            {sortData(users).map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.trades.length}</TableCell>
                <TableCell>{user.trades[0]?.entryDate ? format(new Date(user.trades[0].entryDate), 'yyyy-MM-dd') : '-'}</TableCell>
                <TableCell>
                  {user.trades.length > 0
                    ? format(new Date(user.trades.reduce((latest, trade) =>
                      trade.entryDate > latest ? trade.entryDate : latest,
                      user.trades[0].entryDate
                    )), 'yyyy-MM-dd')
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 

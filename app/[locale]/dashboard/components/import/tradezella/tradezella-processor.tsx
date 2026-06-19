'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Prisma, Trade } from '@/prisma/generated/prisma'
import { decimalToNumber } from '@/lib/trade-types'
import { PlatformProcessorProps } from '../config/platforms'

const newMappings: { [key: string]: string } = {
  "Account Name": "accountNumber",
  "Close Date": "closeDate",
  "Close Time": "closeTime",
  "Commission": "commission",
  "Duration": "timeInPosition",
  "Entry Price": "entryPrice",
  "Open Date": "entryDate",
  "Open Time": "entryTime",
  "Exit Price": "closePrice",
  "Fee": "commission",
  "Gross P&L": "pnl",
  "Instrument": "instrument",
  "Quantity": "quantity",
  "Side": "side",
  "Symbol": "instrument",
  "Adjusted Cost": "entryId",
  "Adjusted Proceeds": "closeId",
}



export default function TradezellaProcessor({ headers, csvData, setProcessedTrades }: PlatformProcessorProps) {
  const [trades, setTrades] = useState<Trade[]>([])

  const processTrades = useCallback(() => {
    const newTrades: Trade[] = [];
    // Default account used when the CSV has no "Account Name" column. Previously
    // this was declared but never applied to trades, so every trade was saved
    // with accountNumber = undefined -> createTradeWithDefaults threw and the
    // entire save silently failed ("Save button doesn't work").
    const defaultAccountNumber = 'default-account';

    csvData.forEach(row => {
      const item: Partial<Trade> = {};
      const quantity = 0;
      let entryTime = '';
      let closeTime = '';
      headers.forEach((header, index) => {
        if (newMappings[header]) {
          const key = newMappings[header];
          const cellValue = row[index];
          switch (key) {
            case 'entryTime':
              entryTime = cellValue as any;
              break;
            case 'closeTime':
              closeTime = cellValue as any;
              break;
            case 'pnl':
              item.pnl = new Prisma.Decimal(parseFloat(cellValue))
              break;
            case 'commission':
              item.commission = new Prisma.Decimal(parseFloat(cellValue))
              break;
            case 'quantity':
              item.quantity = new Prisma.Decimal(parseFloat(cellValue))
              break;
            case 'timeInPosition':
              item.timeInPosition = new Prisma.Decimal(parseFloat(cellValue))
              break;
            default:
              item[key as keyof Trade] = cellValue as any;
          }
        }
      });
      // If item contains undefined values then skip the row
      if (Object.values(item).some(value => value === undefined)) {
        return
      }

      // Fall back to the default account when the CSV did not provide one.
      if (!item.accountNumber) {
        item.accountNumber = defaultAccountNumber;
      }

      // Compute entryDate and closeDate with the time from entryTime and closeTime
      if (entryTime && closeTime) {
        item.entryDate = new Date(`${item.entryDate} ${entryTime.slice(0, 8)}`);
        item.closeDate = new Date(`${item.closeDate} ${closeTime.slice(0, 8)}`);
      }

      newTrades.push(item as Trade);
    })

    setTrades(newTrades);
    setProcessedTrades(newTrades);
  }, [csvData, headers, setProcessedTrades]);

  useEffect(() => {
    processTrades();
  }, [processTrades]);

  const totalPnL = useMemo(() => trades.reduce((sum, trade) => sum + decimalToNumber(trade.pnl), 0), [trades]);
  const totalCommission = useMemo(() => trades.reduce((sum, trade) => sum + decimalToNumber(trade.commission), 0), [trades]);
  const uniqueInstruments = useMemo(() => Array.from(new Set(trades.map(trade => trade.instrument))), [trades]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Processed Trades</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instrument</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Close Price</TableHead>
              <TableHead>Entry Date</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>PnL</TableHead>
              <TableHead>Time in Position</TableHead>
              <TableHead>Commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{trade.instrument}</TableCell>
                <TableCell>{trade.side}</TableCell>
                <TableCell>{decimalToNumber(trade.quantity)}</TableCell>
                <TableCell>{decimalToNumber(trade.entryPrice, null) ?? ''}</TableCell>
                <TableCell>{decimalToNumber(trade.closePrice, null) ?? '-'}</TableCell>
                <TableCell>{new Date(trade.entryDate).toLocaleString()}</TableCell>
                <TableCell>{trade.closeDate ? new Date(trade.closeDate).toLocaleString() : '-'}</TableCell>
                <TableCell>{decimalToNumber(trade.pnl).toFixed(2)}</TableCell>
                <TableCell>{`${Math.floor(decimalToNumber(trade.timeInPosition) / 60)}m ${Math.floor(decimalToNumber(trade.timeInPosition) % 60)}s`}</TableCell>
                <TableCell>{decimalToNumber(trade.commission).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Total PnL</h3>
          <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-[color:var(--success)]' : 'text-[color:var(--destructive)]'}`}>
            {totalPnL.toFixed(2)}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Total Commission</h3>
          <p className="text-xl font-bold text-blue-600">
            {totalCommission.toFixed(2)}
          </p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Instruments Traded</h3>
        <div className="flex flex-wrap gap-2">
          {uniqueInstruments.map((instrument) => (
            <Button
              key={instrument}
              variant="outline"
            >
              {instrument}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}